'use strict';

import Homey from 'homey';
import { UpdatableDevice, isUpdatableDevice } from './types'
import { OcpApi, OcpAuth, OcpAuthError, OcpRateLimitError, describeError } from './lib/ocpapi';
import stringify from 'json-stringify-safe';
let isAppShuttingDown: boolean = false;

const DEFAULT_POLLING_INTERVAL = 300000;
const MIN_POLLING_INTERVAL = 60000;
// Free plan allows 5000 calls/day - keep headroom for commands, pairing, restarts and token refreshes
const DAILY_POLLING_CALL_BUDGET = 4000;
const DAY_MS = 24 * 60 * 60 * 1000;
// Responses younger than this are reused, e.g. for fridge + freezer devices sharing one appliance
const CACHE_MAX_AGE_MS = 30000;

const LEGACY_SETTINGS = ['ocp.username', 'ocp.password', 'aToken', 'tokenexp'];

export type ConnectionStatus = 'ok' | 'not_configured' | 'auth_failed' | 'rate_limited' | 'error';

interface CacheEntry {
  at: number;
  promise: Promise<any>;
}

export default class ElectroluxAEGApp extends Homey.App {

  timeoutId?: NodeJS.Timeout;
  ocpApi: OcpApi = new OcpApi();
  private pollingInProgress = false;
  private authFailed = false;
  private stateCache = new Map<string, CacheEntry>();
  private infoCache = new Map<string, CacheEntry>();
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('ElectroluxAEGApp has been initialized');

    this.registerFlowCardAction("execute_oven_command");
    this.registerFlowCardAction("execute_dishwasher_command");
    this.registerFlowCardAction("execute_laundry_command");
    this.registerFlowCardAction("execute_aircon_command");
    this.registerFlowCardAction("set_aircon_mode");
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

    await this.migrateLegacySettings();

    this.ocpApi.init(
      this.homey.settings.get('ocp.auth') ?? undefined,
      (auth: OcpAuth) => { this.homey.settings.set('ocp.auth', auth); }
    );

    this.homey.settings.on('set', async key => {
      if (key === 'ocp.polling') {
        this.homey.setTimeout(async () => {
          this.startPolling();
          await this.homey.api.realtime("settingsChanged", "otherSuccess");
        }, 500);
      }
      if (key === 'ocp.credentials') {
        await this.applyNewCredentials();
      }
    });

    if (!this.ocpApi.hasCredentials()) {
      this.setStatus('not_configured');
      this.log('credentials missing - enter API key, access token and refresh token in app settings');
      return;
    }

    try {
      await this.ocpApi.getAppliances();
      this.setStatus('ok');
    } catch (e) {
      this.handleApiError('Startup connection check', e);
    }
    this.homey.setTimeout(async () => {
      this.startPolling();
    }, 1000);
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

  /**
   * Versions before 2.0 logged in with the mobile app username/password. Those credentials no
   * longer work, so remove them and tell the user how to set up developer API credentials.
   */
  async migrateLegacySettings() {
    const settingsKeys = this.homey.settings.getKeys();
    const hadLegacySettings = LEGACY_SETTINGS.some(key => settingsKeys.includes(key));
    if (!hadLegacySettings) return;

    for (const key of LEGACY_SETTINGS) this.homey.settings.unset(key);
    this.log('removed legacy username/password settings');

    if (!this.homey.settings.get('ocp.auth')) {
      await this.homey.notifications.createNotification({ excerpt: this.homey.__('auth.migration') })
        .catch(e => this.error(`Failed to create notification: ${e}`));
    }
  }

  async applyNewCredentials() {
    const credentials = this.homey.settings.get('ocp.credentials');
    // Tokens are kept only in 'ocp.auth', which is updated as they rotate
    this.homey.settings.unset('ocp.credentials');
    const apiKey = `${credentials?.apiKey ?? ''}`.trim();
    const accessToken = `${credentials?.accessToken ?? ''}`.trim();
    const refreshToken = `${credentials?.refreshToken ?? ''}`.trim();
    if (!apiKey || !accessToken || !refreshToken) {
      await this.homey.api.realtime("settingsChanged", this.homey.__('settings.error_missing_fields'));
      return;
    }

    try {
      await this.ocpApi.useCredentials(apiKey, accessToken, refreshToken);
      this.log('new credentials validated and saved');
      this.authFailed = false;
      this.setStatus('ok');
      await this.homey.api.realtime("settingsChanged", "loginSuccess");
      this.homey.setTimeout(async () => {
        this.startPolling();
      }, 1000);
    } catch (e) {
      this.log(`new credentials rejected: ${describeError(e)}`);
      const message = e instanceof OcpAuthError
        ? this.homey.__('settings.error_invalid_credentials')
        : `${this.homey.__('settings.error_connect')} (${describeError(e)})`;
      await this.homey.api.realtime("settingsChanged", message);
    }
  }

  setStatus(state: ConnectionStatus, detail?: string) {
    const current = this.homey.settings.get('ocp.status');
    const pollingInterval = this.getEffectivePollingInterval();
    if (current?.state === state && current?.detail === detail && current?.pollingInterval === pollingInterval) return;
    this.homey.settings.set('ocp.status', { state, detail, pollingInterval, updated: Date.now() });
  }

  handleApiError(context: string, e: unknown) {
    if (e instanceof OcpAuthError) {
      void this.onAuthFailed(e);
    } else if (e instanceof OcpRateLimitError) {
      this.log(`${context}: ${e.message}, pausing until ${new Date(e.retryAt).toISOString()}`);
      this.setStatus('rate_limited', new Date(e.retryAt).toISOString());
    } else {
      this.error(`${context}: ${describeError(e)}`);
      this.setStatus('error', describeError(e));
    }
  }

  async onAuthFailed(e: OcpAuthError) {
    if (this.authFailed) return;
    this.authFailed = true;
    this.error(`Credentials rejected: ${e.message}`);
    this.setStatus('auth_failed', e.message);
    for (const device of this.getAllDevices()) {
      await device.setUnavailable(this.homey.__('auth.unavailable')).catch(() => { });
    }
    await this.homey.notifications.createNotification({ excerpt: this.homey.__('auth.notification') })
      .catch(err => this.error(`Failed to create notification: ${err}`));
  }

  getAllDevices(): Homey.Device[] {
    return Object.values(this.homey.drivers.getDrivers()).flatMap(driver => driver.getDevices());
  }

  /** Groups updatable devices by appliance, as one appliance can map to several devices (fridge + freezer). */
  getDevicesByAppliance(): Map<string, (Homey.Device & UpdatableDevice)[]> {
    const devicesByAppliance = new Map<string, (Homey.Device & UpdatableDevice)[]>();
    for (const device of this.getAllDevices()) {
      if (!isUpdatableDevice(device)) continue;
      const applianceId = device.getData().id;
      const list = devicesByAppliance.get(applianceId) ?? [];
      list.push(device as Homey.Device & UpdatableDevice);
      devicesByAppliance.set(applianceId, list);
    }
    return devicesByAppliance;
  }

  getConfiguredPollingInterval(): number {
    const pollingInterval = Number(this.homey.settings.get('ocp.polling'));
    if (!Number.isFinite(pollingInterval) || pollingInterval < MIN_POLLING_INTERVAL) {
      // Default to 5 minutes if not set or too low
      return DEFAULT_POLLING_INTERVAL;
    }
    return pollingInterval;
  }

  /** Stretches the configured interval so that polling all appliances stays within the daily call budget. */
  getEffectivePollingInterval(): number {
    const applianceCount = this.getDevicesByAppliance().size;
    const budgetInterval = Math.ceil((DAY_MS * applianceCount) / DAILY_POLLING_CALL_BUDGET / MIN_POLLING_INTERVAL) * MIN_POLLING_INTERVAL;
    return Math.max(this.getConfiguredPollingInterval(), budgetInterval);
  }

  startPolling() {
    this.homey.clearTimeout(this.timeoutId);
    this.log(`${this.id} polling started...`);
    void this.pollAndSchedule();
  }

  async pollAndSchedule() {
    await this.pollApplianceState();
    if (isAppShuttingDown) return;
    // Recalculated every cycle, since devices may have been added or removed
    const pollingInterval = this.getEffectivePollingInterval();
    if (pollingInterval !== this.getConfiguredPollingInterval()) {
      this.log(`polling every ${pollingInterval / 1000}sec to stay within the daily API quota`);
    }
    this.homey.clearTimeout(this.timeoutId);
    this.timeoutId = this.homey.setTimeout(() => this.pollAndSchedule(), pollingInterval);
  }

  async onUninit(): Promise<void> {
    this.log('App is shutting down.');
    isAppShuttingDown = true;
    this.homey.clearTimeout(this.timeoutId);
    // Wait for a moment to ensure tasks have stopped
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.log('Cleanup completed.');
  }


  async pollApplianceState(onlyApplianceId?: string) {
    if (this.pollingInProgress || isAppShuttingDown) return;
    if (!this.ocpApi.hasCredentials()) return;
    if (this.authFailed) {
      // Also covers devices that finished initialising after the credentials were rejected
      for (const device of this.getAllDevices()) {
        await device.setUnavailable(this.homey.__('auth.unavailable')).catch(() => { });
      }
      return;
    }
    this.pollingInProgress = true;
    try {
      for (const [applianceId, devices] of this.getDevicesByAppliance()) {
        if (isAppShuttingDown) return;
        if (onlyApplianceId && applianceId !== onlyApplianceId) continue;
        let state: any;
        try {
          state = await this.fetchCached(this.stateCache, applianceId, 0, id => this.ocpApi.getApplianceState(id));
        } catch (e) {
          this.handleApiError(`Get Appliance State Error!? ${applianceId}`, e);
          // No point continuing this cycle if credentials or quota are the problem
          if (e instanceof OcpAuthError || e instanceof OcpRateLimitError) return;
          continue;
        }
        this.setStatus('ok');
        for (const device of devices) {
          this.updateDeviceFromState(device, applianceId, state);
        }
      }
    } finally {
      this.pollingInProgress = false;
    }
  }

  updateDeviceFromState(device: Homey.Device & UpdatableDevice, applianceId: string, state: any) {
    try {
      const conn = state?.connectionState;
      const bypassConnectionAvailabilityStatus = device.getSetting('bypassConnectionAvailabilityStatus') === true;
      if (conn === 'connected' || conn === 'Connected') {
        device.setAvailable();
        device.updateCapabilityValues(state);
      } else if (bypassConnectionAvailabilityStatus) {
        this.log(`Bypassing unavailable state for ${applianceId}: ${stringify(state)}`);
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

  /** Reuses an in-flight or recent response, so devices sharing an appliance cost one API call. */
  async fetchCached(cache: Map<string, CacheEntry>, applianceId: string, maxAgeMs: number, fetch: (id: string) => Promise<any>): Promise<any> {
    const entry = cache.get(applianceId);
    const now = Date.now();
    // An entry that's still in flight is always reused
    if (entry && (now - entry.at <= Math.max(maxAgeMs, 1000))) return entry.promise;
    const promise = fetch(applianceId);
    cache.set(applianceId, { at: now, promise });
    promise.catch(() => {
      if (cache.get(applianceId)?.promise === promise) cache.delete(applianceId);
    });
    return promise;
  }

  async getAppliances(): Promise<any[]> {
    try {
      const appliances = await this.ocpApi.getAppliances();
      this.setStatus('ok');
      return appliances;
    } catch (e) {
      this.handleApiError('Get Appliances Error!?', e);
      return [];
    }
  }

  async getApplianceState(deviceId: string): Promise<any> {
    try {
      return await this.fetchCached(this.stateCache, deviceId, CACHE_MAX_AGE_MS, id => this.ocpApi.getApplianceState(id));
    } catch (e) {
      this.handleApiError(`Get Appliance State Error!? ${deviceId}`, e);
      return {};
    }
  }

  async getApplianceCapabilities(deviceId: string): Promise<any> {
    try {
      const info = await this.fetchCached(this.infoCache, deviceId, CACHE_MAX_AGE_MS, id => this.ocpApi.getApplianceInfo(id));
      return info?.capabilities ?? {};
    } catch (e) {
      this.handleApiError(`Get Appliance Capabilities Error!? ${deviceId}`, e);
      return {};
    }
  }

  async sendDeviceCommand(deviceId: string, command: any) {
    try {
      await this.ocpApi.sendCommand(deviceId, command);
      this.homey.setTimeout(async () => {
        this.pollApplianceState(deviceId);
      }, 1000);

    } catch (e) {
      this.handleApiError(`Send Command Error!? ${deviceId}`, e);
    }
  }
}

module.exports = ElectroluxAEGApp;
