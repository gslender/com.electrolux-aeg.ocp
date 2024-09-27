'use strict';

import Homey from 'homey';
import { UpdatableDevice, isUpdatableDevice } from './types'
import { OcpApi } from './lib/ocpapi';

export default class ElectroluxAEGApp extends Homey.App {

  timeoutId!: NodeJS.Timeout;
  ocpApiFactory: OcpApi = new OcpApi();
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('ElectroluxAEGApp has been initialized');
    // this.homey.settings.unset('ocp.username');
    // this.homey.settings.unset('ocp.password');

    this.registerFlowCardAction("execute_command");
    this.registerFlowCardAction("enable_cavity_light");
    this.registerFlowCardAction("disable_cavity_light");
    this.registerFlowCardAction("set_fan_speed");
    this.registerFlowCardAction("enable_smart_mode");
    this.registerFlowCardAction("enable_manual_mode");
    this.registerFlowCardAction("enable_ionizer");
    this.registerFlowCardAction("disable_ionizer");
    this.registerFlowCardAction("enable_lock");
    this.registerFlowCardAction("disable_lock");
    this.registerFlowCardAction("enable_indicator_light");
    this.registerFlowCardAction("disable_indicator_light");

    this.registerFlowCardCondtion("applianceState_is");
    this.registerFlowCardCondtion("connectionState_is");
    this.registerFlowCardCondtion("remoteControl_is");
    this.registerFlowCardCondtion("cyclePhase_is");

    this.ocpApiFactory.init(
      () => { return this.homey.settings.get('ocp.username'); },
      () => { return this.homey.settings.get('ocp.password'); },
      () => { return this.homey.settings.get('aToken'); },
      (token) => { this.homey.settings.set('aToken', token); },
      () => { return this.homey.settings.get('tokenexp'); },
      (exp) => { this.homey.settings.set('tokenexp', exp); }
    );

    this.homey.settings.on('set', async key => {
      if (key === 'ocp.polling') {
        this.homey.clearInterval(this.timeoutId);
        this.homey.setTimeout(async () => {
          this.startPolling();
          await this.homey.api.realtime("settingsChanged", "otherSuccess");
        }, 500);
      }
      if (key === 'ocp.username' || key === 'ocp.password') {
        this.log(`onSettingsChanged() ${this.homey.settings.get('ocp.username')}`);
        const usernameLoginSuccess = await this.attemptUsernameLogin();
        if (usernameLoginSuccess) {
          await this.homey.api.realtime("settingsChanged", "loginSuccess");
          this.homey.clearInterval(this.timeoutId);
          this.homey.setTimeout(async () => {
            this.startPolling();
          }, 1000);
        } else {
          await this.homey.api.realtime("settingsChanged", "Login/Password Incorrect!!");
        }
      }
    });

    let canStartUp: boolean = await this.attemptAccessTokenCheck();
    if (!canStartUp) {
      canStartUp = await this.attemptUsernameLogin();
    }

    if (canStartUp) {
      this.homey.setTimeout(async () => {
        this.startPolling();
      }, 1000);
    } else {
      this.log('credentials missing/invalid - verify correct app settings and restart app');
    }
  }


  registerFlowCardAction(cardName: string) {
    const card = this.homey.flow.getActionCard(cardName);
    card.registerRunListener((args, state) => {
      return args.device["flow_" + cardName](args, state);
    });
  }

  registerFlowCardCondtion(cardName: string) {
    const card = this.homey.flow.getConditionCard(cardName);
    card.registerRunListener(async (args, state) => {
      this.log(`${"flow_" + cardName} args=${args} state=${state}`);
      return args.device["flow_" + cardName](args, state);
    });
  }


  async startPolling() {
    let pollingInterval = this.homey.settings.get('ocp.polling');
    if (isNaN(pollingInterval) || pollingInterval === null || pollingInterval === undefined) {
      pollingInterval = 15000;
    } else {
      pollingInterval = Number(pollingInterval);
    }
    this.log(`${this.id} polling every ${pollingInterval / 1000}sec started...`);

    this.pollApplianceState();
    this.timeoutId = this.homey.setInterval(() => {
      this.pollApplianceState();
    }, pollingInterval);
  }


  async pollApplianceState() {
    const drivers = this.homey.drivers.getDrivers();
    for (const driver in drivers) {
      const devices = this.homey.drivers.getDriver(driver).getDevices();
      for (const device of devices) {
        if (isUpdatableDevice(device)) {
          const applianceId = device.getData().id;
          const state = await this.getApplianceState(applianceId);
          if (state?.connectionState === 'connected' ||
            state?.connectionState === 'Connected') {
            device.setAvailable();
            device.updateCapabilityValues(state);
          } else {
            this.log(`${JSON.stringify(state)}`);
            device.setUnavailable();
          }
        }
      }
    }
  }


  isAccessTokenExpired() {
    const tokenexp = this.homey.settings.get('tokenexp');
    return tokenexp <= Date.now();
  }

  async attemptAccessTokenCheck(): Promise<boolean> {

    try {
      this.log(`attemptAccessTokenCheck() isAccessTokenExpired:${this.isAccessTokenExpired()}`);
      const http = await this.ocpApiFactory.createHttp();
      const response = await http.get(`/appliances?includeMetadata=true`);
      if (response && response.data) return true;
    } catch (e) {
      this.log(`attemptLogin failed: ${e}`);
    }
    return false;
  }

  async attemptUsernameLogin(): Promise<boolean> {
    const username = this.homey.settings.get('ocp.username');
    const password = this.homey.settings.get('ocp.password');
    if (this.isEmptyOrUndefined(username) || this.isEmptyOrUndefined(password)) return false;
    try {
      this.log(`attemptUsernameLogin() ${username}`);
      await this.ocpApiFactory.login();
      return true;
    } catch (e) {
      this.log(`attemptLogin failed: ${e}`);
    }
    return false;
  }

  async getAppliances(): Promise<any[]> {
    try {
      const http = await this.ocpApiFactory.createHttp();
      const response = await http.get(`/appliances?includeMetadata=true`);
      if (response && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      } else {
        return [];
      }
    } catch (e) {
      this.error(`Get Appliances Error!? ${e}`);
      return [];
    }
  }

  async getApplianceState(deviceId: String): Promise<any> {
    try {
      const http = await this.ocpApiFactory.createHttp();
      const response = await http.get(`/appliances/${deviceId}`);
      return response.data ?? {};
    } catch (e) {
      this.error(`Get Appliance State Error!? ${deviceId} : ${e}`);
      return {};
    }
  }

  async getApplianceCapabilities(deviceId: String): Promise<any> {
    try {
      const http = await this.ocpApiFactory.createHttp();
      const response = await http.get(`/appliances/${deviceId}/capabilities`);
      return response.data ?? {};
    } catch (e) {
      this.error(`Get Appliance Capabilities Error!? ${deviceId} : ${e}`);
      return {};
    }
  }

  async sendDeviceCommand(deviceId: string, command: any) {
    try {
      const http = await this.ocpApiFactory.createHttp();
      await http.put(`/appliances/${deviceId}/command`, command);
      this.homey.setTimeout(async () => {
        this.pollApplianceState();
      }, 1000);

    } catch (e) {
      this.error(`Send Command Error!? ${deviceId} : ${e}`);
    }
  }

  isEmptyOrUndefined(value: any) {
    return value === undefined || value === null || value === '';
  }
}

module.exports = ElectroluxAEGApp;