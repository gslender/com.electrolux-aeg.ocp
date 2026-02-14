'use strict';

import Homey from 'homey';
import { UpdatableDevice, isUpdatableDevice } from './types'
import { OcpApi } from './lib/ocpapi';
import stringify from 'json-stringify-safe';
let isAppShuttingDown: boolean = false;

export default class ElectroluxAEGApp extends Homey.App {

  timeoutId!: NodeJS.Timeout;
  ocpApiFactory: OcpApi = new OcpApi();
  private pollingInProgress = false;
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('ElectroluxAEGApp has been initialized');
    // this.homey.settings.unset('ocp.username');
    // this.homey.settings.unset('ocp.password');

    this.registerFlowCardAction("execute_oven_command");
    this.registerFlowCardAction("execute_dishwasher_command");
    this.registerFlowCardAction("execute_laundry_command");
    this.registerFlowCardAction("execute_aircon_command");
    this.registerFlowCardAction("execute_robot_command");
    this.registerFlowCardAction("execute_robot700_cleaning_command");
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

    this.registerFlowCardCondition("applianceState_is");
    this.registerFlowCardCondition("connectionState_is");
    this.registerFlowCardCondition("remoteControl_is");
    this.registerFlowCardCondition("cyclePhase_is");

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

  registerFlowCardCondition(cardName: string) {
    const card = this.homey.flow.getConditionCard(cardName);
    card.registerRunListener(async (args, state) => {
      this.log(`flow_${cardName} args=${stringify(args)} state=${stringify(state)}`);
      return args.device["flow_" + cardName](args, state);
    });
  }


  async startPolling() {
    const raw = this.homey.settings.get('ocp.polling');
    let pollingInterval = Number(raw);
    if (!Number.isFinite(pollingInterval) || pollingInterval < 60000) {
      // Default to 5 minutes if not set or too low
      pollingInterval = 300000;
    }

    // Ensure we don't leak intervals on repeated calls
    this.homey.clearInterval(this.timeoutId);

    this.log(`${this.id} polling every ${pollingInterval / 1000}sec started...`);

    // Kick off an immediate poll, then schedule subsequent polls
    await this.pollApplianceState();
    this.timeoutId = this.homey.setInterval(() => {
      void this.pollApplianceState();
    }, pollingInterval);
  }

  async onUninit(): Promise<void> {
    this.log('App is shutting down.');
    isAppShuttingDown = true;
    this.homey.clearInterval(this.timeoutId);
    // Wait for a moment to ensure tasks have stopped
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.log('Cleanup completed.');
  }


  async pollApplianceState() {
    if (this.pollingInProgress || isAppShuttingDown) return;
    this.pollingInProgress = true;
    try {
      const driversMap = this.homey.drivers.getDrivers();
      const drivers = Object.values(driversMap);
      for (const driver of drivers) {
        if (isAppShuttingDown) return;
        const devices = driver.getDevices();
        for (const device of devices) {
          if (isAppShuttingDown) return;
          if (isUpdatableDevice(device)) {
            try {
              const applianceId = device.getData().id;
              const state = await this.getApplianceState(applianceId);
              const conn = state?.connectionState;
              if (conn === 'connected' || conn === 'Connected') {
                device.setAvailable();
                device.updateCapabilityValues(state);
              } else {
                this.log(`Disconnected or unknown state for ${applianceId}: ${stringify(state)}`);
                device.setUnavailable();
              }
            } catch (err) {
              this.error(`Device poll error: ${err}`);
            }
          }
        }
      }
    } finally {
      this.pollingInProgress = false;
    }
  }


  isAccessTokenExpired() {
    const raw = this.homey.settings.get('tokenexp');
    const tokenexp = Number(raw);
    return !Number.isFinite(tokenexp) || tokenexp <= Date.now();
  }

  async attemptAccessTokenCheck(): Promise<boolean> {
    try {
      this.log(`attemptAccessTokenCheck() isAccessTokenExpired:${this.isAccessTokenExpired()}`);
      if (this.isAccessTokenExpired()) return false;
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

  async getApplianceState(deviceId: string): Promise<any> {
    try {
      const http = await this.ocpApiFactory.createHttp();
      const response = await http.get(`/appliances/${deviceId}`);
      return response.data ?? {};
    } catch (e) {
      this.error(`Get Appliance State Error!? ${deviceId} : ${e}`);
      return {};
    }
  }

  async getApplianceCapabilities(deviceId: string): Promise<any> {
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
