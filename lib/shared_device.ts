import Homey from 'homey';
import stringify from 'json-stringify-safe';
import ElectroluxAEGApp from '../app'

export default class SharedDevice extends Homey.Device {

  app!: ElectroluxAEGApp
  static enableDebug = true;
  private refreshInterval: NodeJS.Timeout | null = null;
  deviceCapabilities!: string[]
  alertIndex: number = 0;

  async onInit() {
    this.log("Device Init: " + this.getName());
    this.app = this.homey.app as ElectroluxAEGApp;

    const deviceId = this.getData().id;
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

  toTitleCase(input: string): string {
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

  async updateCapabilities() {
  }

  async updateMeasureAlerts(props: any) {
    if (props.alerts && props.alerts.length > 0) {
      this.alertIndex = (this.alertIndex + 1) % props.alerts.length;
      const currentCode = props.alerts[this.alertIndex].code;
      await this.setCapabilityValue("measure_alerts", this.toTitleCase(currentCode));
    } else {
      await this.setCapabilityValue("measure_alerts", this.homey.__('measure_alerts_none'));
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
