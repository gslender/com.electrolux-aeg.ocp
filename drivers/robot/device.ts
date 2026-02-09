import SharedDevice from '../../lib/shared_device';
import RobotDriver from './driver';
import stringify from 'json-stringify-safe';

class RobotDevice extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = RobotDriver.DeviceCapabilities;
    await super.onInit();

    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "execute_command", "power_mode"
      ],
      (valueObj, optsObj) => this.setDeviceOpts(valueObj),
      500
    );
  }

  async setDeviceOpts(valueObj: { [x: string]: any }) {
    const deviceId = this.getData().id;

    try {

      // Update execute_command
      if (valueObj.execute_command !== undefined) {
        this.log("execute_command: " + valueObj.execute_command);
        let cmd = 'stop';
        if (valueObj.execute_command === 'START' || valueObj.execute_command === 'RESUME') cmd = 'play';
        if (valueObj.execute_command === 'PAUSE') cmd = 'pause';
        await this.app.sendDeviceCommand(deviceId, { CleaningCommand: cmd });
      }

      // Update power_mode
      if (valueObj.power_mode !== undefined) {
        this.log("power_mode: " + valueObj.power_mode);
        await this.app.sendDeviceCommand(deviceId, { PowerMode: Number(valueObj.power_mode) });
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
      await this.safeUpdateCapabilityValue("measure_battery", (props.batteryStatus - 1) * 20);
      await this.safeUpdateCapabilityValue("measure_applianceState", this.homey.__(`robot_status.${props.robotStatus}`));
      await this.safeUpdateCapabilityValue("power_mode", `${props.powerMode}`);
      await this.updateMeasureStrings(props.messageList.messages);
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

  async flow_connectionState_is(args: { value: string }, state: {}) {
    this.log(`flow_connectionState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    const latestState = await this.app.getApplianceState(this.getData().id);
    return this.compareCaseInsensitiveString(args.value, this.translateUnderscore(latestState?.connectionState));
  }
}

module.exports = RobotDevice;
