import SharedDevice from '../../lib/shared_device';
import RangeHoodDriver from './driver';
import stringify from 'json-stringify-safe';

class RangeHoodDevice extends SharedDevice {
  private static readonly LastNonOffFanLevelStoreKey = 'rangehood_last_non_off_fan_level';
  private static readonly LastNonZeroLightStoreKey = 'rangehood_last_non_zero_light_intensity';
  private static readonly DefaultFanLevel = 'STEP_1';
  private static readonly DefaultLightIntensity = 1;

  async onInit() {
    this.deviceCapabilities = RangeHoodDriver.DeviceCapabilities;
    await super.onInit();

    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "onoff",
        "hoodFanLevel",
        "hoodLightIntensity"
      ],
      (valueObj, optsObj) => this.setDeviceOpts(valueObj),
      500
    );
  }

  private isFanOn(level: any): boolean {
    return typeof level === 'string' && level !== 'OFF';
  }

  private normalizeLightIntensity(value: any): number {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    if (num < 0) return 0;
    if (num > 100) return 100;
    return Math.round(num);
  }

  private async persistRestoreValues(fanLevel: any, lightIntensity: any): Promise<void> {
    if (this.isFanOn(fanLevel)) {
      await this.setStoreValue(RangeHoodDevice.LastNonOffFanLevelStoreKey, fanLevel);
    }

    const normalizedLight = this.normalizeLightIntensity(lightIntensity);
    if (normalizedLight > 0) {
      await this.setStoreValue(RangeHoodDevice.LastNonZeroLightStoreKey, normalizedLight);
    }
  }

  private async getRestoreFanLevel(currentFan: any): Promise<string> {
    if (this.isFanOn(currentFan)) return currentFan;
    const stored = await this.getStoreValue(RangeHoodDevice.LastNonOffFanLevelStoreKey);
    if (this.isFanOn(stored)) return stored;
    return RangeHoodDevice.DefaultFanLevel;
  }

  private async getRestoreLightIntensity(currentLight: any): Promise<number> {
    const current = this.normalizeLightIntensity(currentLight);
    if (current > 0) return current;
    const stored = await this.getStoreValue(RangeHoodDevice.LastNonZeroLightStoreKey);
    const storedValue = this.normalizeLightIntensity(stored);
    if (storedValue > 0) return storedValue;
    return RangeHoodDevice.DefaultLightIntensity;
  }

  private async sendOnOffMacro(deviceId: string, requestedOnOff: any): Promise<void> {
    const shouldTurnOn = requestedOnOff === true || requestedOnOff === 'true';
    if (!shouldTurnOn) {
      await this.app.sendDeviceCommand(deviceId, { hoodFanLevel: 'OFF', lightIntensity: 0 });
      this.log('onoff macro: OFF -> hoodFanLevel=OFF, lightIntensity=0');
      return;
    }

    const currentFan = this.getCapabilityValue('hoodFanLevel');
    const currentLight = this.getCapabilityValue('hoodLightIntensity');
    const restoreFan = await this.getRestoreFanLevel(currentFan);
    const restoreLight = await this.getRestoreLightIntensity(currentLight);
    await this.app.sendDeviceCommand(deviceId, {
      hoodFanLevel: restoreFan,
      lightIntensity: restoreLight,
    });
    this.log(`onoff macro: ON -> hoodFanLevel=${restoreFan}, lightIntensity=${restoreLight}`);
  }

  async setDeviceOpts(valueObj: { [x: string]: any }) {
    const deviceId = this.getData().id;

    try {
      if (valueObj.onoff !== undefined) {
        await this.sendOnOffMacro(deviceId, valueObj.onoff);
      }

      const commandMapping: { [x: string]: string } = {
        hoodFanLevel: "hoodFanLevel",
        hoodLightIntensity: "lightIntensity",
      };

      // Update other capabilities
      const capabilitiesToUpdate = [
        "hoodFanLevel",
        "hoodLightIntensity",
      ];

      for (const cap of capabilitiesToUpdate) {
        if (valueObj[cap] !== undefined) {
          const apiCommandName = commandMapping[cap] || cap;
          const commandValue = cap === "hoodLightIntensity"
            ? this.normalizeLightIntensity(valueObj[cap])
            : valueObj[cap];

          await this.app.sendDeviceCommand(deviceId, {
            [apiCommandName]: commandValue,
          });
          this.log(`${cap}: ${commandValue}`);

          if (cap === "hoodFanLevel" && this.isFanOn(commandValue)) {
            await this.setStoreValue(RangeHoodDevice.LastNonOffFanLevelStoreKey, commandValue);
          }
          if (cap === "hoodLightIntensity" && commandValue > 0) {
            await this.setStoreValue(RangeHoodDevice.LastNonZeroLightStoreKey, commandValue);
          }

        }
      }
    } catch (error) {
      this.log(`Error in setDeviceOpts: ${error}`);
    }
  }

  async updateCapabilityValues(state: any) {
    if (!state.properties || !state.properties.reported) {
      this.log("Device data is missing or incomplete");
      return;
    }

    const props = state.properties.reported;

    try {
      await this.safeUpdateCapabilityValue("onoff", props.hoodFanLevel !== "OFF" || props.lightIntensity > 0);
      await this.safeUpdateCapabilityValue("hoodFanLevel", props.hoodFanLevel);
      await this.safeUpdateCapabilityValue("hoodLightIntensity", props.lightIntensity);
      await this.persistRestoreValues(props.hoodFanLevel, props.lightIntensity);
      await this.safeUpdateCapabilityValue("measure_connectionState", this.translateUnderscore(state.connectionState));
      await this.safeUpdateCapabilityValue("measure_applianceState", this.translateUnderscore(props.applianceState));
      await this.safeUpdateCapabilityValue("measure_applianceMode", this.translateUnderscore(props.program));
      await this.updateMeasureAlerts(props);

      this.log("Device data updated");
    } catch (error) {
      this.log("Error updating device state: ", error);
    }

  }

  flow_execute_command(args: { what: string }, state: {}) {
    return this.setDeviceOpts({ execute_command: args.what });
  }

  flow_applianceState_is(args: { value: string }, state: {}) {
    this.log(`flow_applianceState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value, this.getCapabilityValue("measure_applianceState"));
  }

  flow_connectionState_is(args: { value: string }, state: {}) {
    this.log(`flow_connectionState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value, this.getCapabilityValue("measure_connectionState"));
  }

}

module.exports = RangeHoodDevice;
