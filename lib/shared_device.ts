import Homey from 'homey';
import stringify from 'json-stringify-safe';
import ElectroluxAEGApp from '../app'
import { isDamAppliance } from './ocpapi';

export default class SharedDevice extends Homey.Device {

  app!: ElectroluxAEGApp
  static enableDebug = true;
  deviceCapabilities!: string[]
  // Appliance type DAM properties are nested under, for when the capabilities couldn't be fetched
  damNamespace?: string;
  stringsIdx: number = 0;

  async onInit() {
    this.log("Device Init: " + this.getName());
    this.app = this.homey.app as ElectroluxAEGApp;

    const deviceId = this.getApplianceId();
    const state = await this.app.getApplianceState(deviceId);
    this.setSettings({ applianceState: stringify(state) });
    const capabilities = await this.app.getApplianceCapabilities(deviceId);
    this.setSettings({ applianceCapabilities: stringify(capabilities) });

    this.deviceCapabilities = this.deviceCapabilities ?? [];
    if (this._isMissingAnyCapabilities(this.deviceCapabilities)) {
      await this._removeAllExistingCapabilities();
      await this._addMissingCapabilities(this.deviceCapabilities);
    }
  }

  protected getApplianceId(): string {
    const data: any = this.getData();
    return data.id;
  }

  protected getApplianceCapabilitiesSetting(): any {
    const raw = this.getSetting('applianceCapabilities');
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    if (typeof raw !== 'string') return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  /** DAM appliances nest their capabilities, state and commands under the appliance type (e.g. airConditioner). */
  protected isDam(): boolean {
    return isDamAppliance(this.getApplianceId());
  }

  private findKey(obj: any, name: string): string | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    const target = name.toLowerCase();
    return Object.keys(obj).find(key => key.toLowerCase() === target);
  }

  /** Looks up a capability by name (case insensitive), including those nested under a DAM appliance type. */
  protected findApplianceCapability(capabilityName: string): { namespace?: string, name: string, capability: any } | undefined {
    const capabilities = this.getApplianceCapabilitiesSetting();
    const rootKey = this.findKey(capabilities, capabilityName);
    if (rootKey) return { name: rootKey, capability: capabilities[rootKey] };
    if (!this.isDam()) return undefined;
    for (const [namespace, group] of Object.entries<any>(capabilities)) {
      const key = this.findKey(group?.properties, capabilityName);
      if (key) return { namespace, name: key, capability: group.properties[key] };
    }
    return undefined;
  }

  /** The appliance type DAM properties are nested under, used when the capabilities don't tell. */
  protected getDamNamespace(): string | undefined {
    const capabilities = this.getApplianceCapabilitiesSetting();
    for (const [namespace, group] of Object.entries<any>(capabilities)) {
      if (this.findKey(group?.properties, 'executeCommand') || this.findKey(group?.properties, 'applianceState')) return namespace;
    }
    return this.damNamespace;
  }

  protected supportsCommandValue(capabilityName: string, value: any): boolean {
    const capabilities = this.getApplianceCapabilitiesSetting();
    if (Object.keys(capabilities).length === 0) return true;
    const capability = this.findApplianceCapability(capabilityName)?.capability;
    if (!capability || typeof capability !== 'object') return false;
    const values = capability.values;
    if (!values || typeof values !== 'object') return true;
    if (Object.keys(values).length === 0) return true;
    const key = this.findKey(values, String(value));
    return key !== undefined && values[key]?.disabled !== true;
  }

  protected assertCommandSupported(capabilityName: string, value: any) {
    if (!this.supportsCommandValue(capabilityName, value)) {
      throw new Error(this.homey.__('errors.command_not_supported', { value: `${value}` }));
    }
  }

  /**
   * Maps a command onto the appliance's capabilities, using their exact name and value casing. For DAM
   * appliances each property is nested under its appliance type, e.g. { airConditioner: { mode: 'cool' } }.
   */
  protected toApiCommand(command: { [property: string]: any }): any {
    const apiCommand: any = {};
    for (const [property, value] of Object.entries(command)) {
      const found = this.findApplianceCapability(property);
      const name = found?.name ?? property;
      const apiValue = typeof value === 'string' ? this.findKey(found?.capability?.values, value) ?? value : value;
      const namespace = found ? found.namespace : (this.isDam() ? this.getDamNamespace() : undefined);
      if (namespace) {
        apiCommand[namespace] = { ...apiCommand[namespace], [name]: apiValue };
      } else {
        apiCommand[name] = apiValue;
      }
    }
    return apiCommand;
  }

  /** Sends a command, throwing if the appliance rejects it. Properties in one command are applied in any order. */
  protected async sendCommand(command: { [property: string]: any }) {
    await this.app.sendDeviceCommand(this.getApplianceId(), this.toApiCommand(command));
  }

  /** The reported state, with a DAM appliance's nested properties lifted to the root to match the classic layout. */
  protected getReportedProps(state: any): any {
    const reported = state?.properties?.reported;
    if (!reported || !this.isDam()) return reported;
    const namespace = this.getDamNamespace();
    const nested = namespace ? reported[namespace] : undefined;
    return nested && typeof nested === 'object' ? { ...reported, ...nested } : reported;
  }

  private _isMissingAnyCapabilities(caps: string[]): boolean {
    for (const cap of caps) {
      if (!this.hasCapability(cap)) {
        this.log("Missing capability " + cap);
        return true;
      }
    }
    return false;
  }

  private async _addMissingCapabilities(caps: string[]) {
    for (const cap of caps) {
      if (!this.hasCapability(cap)) {
        this.log("Adding capability " + cap);
        await this.addCapability(cap);
      }
    }
  }

  private async _removeAllExistingCapabilities() {
    const caps = this.getCapabilities();
    for (const cap of caps) {
      if (this.hasCapability(cap)) {
        this.log("Remove capability " + cap);
        await this.removeCapability(cap);
      }
    }
  }

  safeUppercase(input: any): string {
    if (typeof input === 'string') {
      return input.toUpperCase();
    }
    return '';
  }

  translateCamelCase(input: string): string {
    if (input === undefined || input === null) return '';
    return input
      // Insert a space before each uppercase letter
      .replace(/([A-Z])/g, ' $1')
      // Capitalise the first letter of each word
      .replace(/^./, str => str.toUpperCase())
      // Trim the result to remove any extra leading space
      .trim();
  }

  translateUnderscore(input: string): string {
    if (input === undefined || input === null) return '';

    if (input === 'NOT_SAFETY_RELEVANT_ENABLED') input = 'DISABLED';
    const words = input.split('_');
    const capitalizedWords = words.map(word => {
      if (/[a-zA-Z]/.test(word.charAt(0))) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        return word;
      }
    });
    return capitalizedWords.join(' ');
  }

  compareCaseInsensitiveString(str1: any, str2: any): boolean {
    if (typeof str1 != 'string' || typeof str2 != 'string') return false;
    return str1.toLowerCase() === str2.toLowerCase();
  }

  flow_applianceState_is(args: { value: string }, state: {}) {
    this.log(`flow_applianceState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(this.translateUnderscore(args.value), this.getCapabilityValue("measure_applianceState"));
  }

  async updateCapabilities() {
  }

  async safeUpdateCapabilityValue(key: string, value: any) {
    // this.log(`capability '${key}' is ${value}}`);
    if (this.hasCapability(key)) {
      if (typeof value !== 'undefined' && value !== null) {
        await this.setCapabilityValue(key, value);
      } else {
        this.log(`'value' for capability '${key}' is undefined`);
      }
    } else {
      this.log(`missing capability: '${key}'`);
    }
  }

  async updateMeasureAlerts(props: any) {
    this.updateMeasureStrings(props.alerts);
  }

  async updateMeasureStrings(strings: any) {
    if (strings && strings.length > 0) {
      this.stringsIdx = (this.stringsIdx + 1) % strings.length;
      const currentCode = strings[this.stringsIdx].code;
      await this.safeUpdateCapabilityValue("measure_alerts", this.translateUnderscore(currentCode));
    } else {
      await this.safeUpdateCapabilityValue("measure_alerts", this.homey.__('measure_alerts_none'));
    }
  }

  convertSecondsToMinNumber(seconds: number): number {
    if (seconds < 0) return 0;
    return Math.floor(seconds / 60);
  }

  convertSecondsToHrMinString(seconds: number): string {
    if (seconds < 0) return '';
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    // Format the time into 24-hour format (HH:MM:SS)
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    if (hours < 1) {
      if (minutes < 2) return `${minutes} minute`;
      return `${minutes} minutes`;
    }

    return `${formattedHours}:${formattedMinutes}`;
  }

  onDeleted(): void {
    this.log("Device " + this.getName() + " deleted!");
  }
}

module.exports = SharedDevice;
