import SharedDevice from '../../lib/shared_device';
import Robot700Driver from './driver';
import stringify from 'json-stringify-safe';

class Robot700Device extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = Robot700Driver.DeviceCapabilities;
    await super.onInit();

    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "cleaning_command", "power_mode"
      ],
      (valueObj, optsObj) => this.setDeviceOpts(valueObj),
      500
    );
  }

  async setDeviceOpts(valueObj: { [x: string]: any }) {
    const deviceId = this.getData().id;

    try {

      // Update cleaning_command
      if (valueObj.cleaning_command !== undefined) {
        this.log("cleaning_command: " + valueObj.cleaning_command);
        await this.app.sendDeviceCommand(deviceId, { cleaningCommand: valueObj.cleaning_command });
      }

      // Update vacuum_mode
      if (valueObj.vacuum_mode !== undefined) {
        this.log("vacuum_mode: " + valueObj.vacuum_mode);
        await this.app.sendDeviceCommand(deviceId, { vacuumMode: Number(valueObj.vacuum_mode) });
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
    const model = state.applianceData.modelName;

    try {
      await this.safeUpdateCapabilityValue("measure_battery", props.batteryStatus);
      await this.safeUpdateCapabilityValue("measure_applianceState", this.homey.__(`robot_state.${props.state}`));
      await this.safeUpdateCapabilityValue("measure_applianceMode", this.translateCamelCase(props.cleaningMode));
      await this.safeUpdateCapabilityValue("vacuum_mode", `${props.vacuumMode}`);
    } catch (error) {
      this.log("Error updating device state: ", error);
    }
  }

  flow_execute_command(args: { what: string }, state: {}) {
    this.log(`flow_execute_command: args=${stringify(args.what)} state=${stringify(state)}`);
    return this.setDeviceOpts({ execute_command: args.what });
  }

  flow_applianceState_is(args: { value: string }, state: {}) {
    this.log(`flow_applianceState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value, this.getCapabilityValue("measure_applianceState"));
  }
}

module.exports = Robot700Device;
