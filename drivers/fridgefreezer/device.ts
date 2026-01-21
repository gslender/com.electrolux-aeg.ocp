import SharedDevice from '../../lib/shared_device';
import FridgeFreezerDriver from './driver';
import stringify from 'json-stringify-safe';

class FridgeFreezerDevice extends SharedDevice {
  subtype!: string;
  applianceId!: string;

  async onInit() {
    this.deviceCapabilities = FridgeFreezerDriver.DeviceCapabilities;
    this.subtype = this.getData().subtype ?? 'fridge';
    this.applianceId = this.getApplianceId();
    await super.onInit();

    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "execute_command"
      ],
      (valueObj, optsObj) => this.setDeviceOpts(valueObj),
      500
    );
  }

  async setDeviceOpts(valueObj: { [x: string]: any }) {
    const deviceId = this.applianceId;

    try {

      // Update execute_command
      if (valueObj.execute_command !== undefined) {
        this.log("execute_command: " + valueObj.execute_command);
        await this.app.sendDeviceCommand(deviceId, { executeCommand: valueObj.execute_command });
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
    const subProps = props[this.subtype] ?? {};

    try {
      await this.safeUpdateCapabilityValue("measure_doorState", this.translateUnderscore(subProps.doorState));
      await this.safeUpdateCapabilityValue("measure_applianceState", this.translateUnderscore(subProps.applianceState));
      await this.safeUpdateCapabilityValue("measure_targetTemperature", subProps.targetTemperatureC);
      await this.safeUpdateCapabilityValue("measure_fanState", this.translateUnderscore(subProps.fanState));
      await this.safeUpdateCapabilityValue("measure_energySavingMode", this.translateUnderscore(props.energySavingMode));
      await this.safeUpdateCapabilityValue("measure_connectionState", this.translateUnderscore(props.connectivityState));     
      await this.updateMeasureAlerts(subProps);

      this.log("Device data updated");
    } catch (error) {
      this.log("Error updating device state: ", error);
    }

  }

  flow_execute_command(args: {what: string}, state: {}) {
    return this.setDeviceOpts({ execute_command: args.what });
  }

  flow_applianceState_is(args: { value: string }, state: {}) {
    this.log(`flow_applianceState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_applianceState"));
  }

  flow_connectionState_is(args: { value: string }, state: {}) {
    this.log(`flow_connectionState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_connectionState"));
  }
  
}

module.exports = FridgeFreezerDevice;
