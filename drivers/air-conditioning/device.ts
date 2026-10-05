import SharedDevice from '../../lib/shared_device';
import AirConditionerDriver from './driver';
import stringify from 'json-stringify-safe';

class AirConditionerDevice extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = AirConditionerDriver.DeviceCapabilities;
    this.damNamespace = 'airConditioner';
    await super.onInit();

    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "onoff", "target_temperature", "aircon_execute_command", "fan_mode", "aircon_mode"
      ],
      (valueObj, optsObj) => this.setDeviceOpts(valueObj),
      500
    );
  }

  // Classic appliances use upper case values (COOL, FANONLY), DAM ones camel case (cool, fanOnly) - the
  // capabilities hold the exact casing, these are the fallbacks for when they couldn't be fetched
  private toApiMode(mode: string): string {
    if (!this.isDam()) return this.safeUppercase(mode);
    return mode === 'fanonly' ? 'fanOnly' : mode;
  }

  private toApiFanMode(fanMode: string): string {
    if (!this.isDam()) return this.safeUppercase(fanMode);
    // DAM calls the middle fan speed "medium", although some models also list "middle"
    const values = this.findApplianceCapability('fanMode')?.capability?.values;
    return fanMode === 'middle' && values?.middle === undefined ? 'medium' : fanMode;
  }

  private async sendExecuteCommand(command: 'ON' | 'OFF') {
    const apiCommand = this.isDam() ? command.toLowerCase() : command;
    this.assertCommandSupported('executeCommand', apiCommand);
    await this.sendCommand({ executeCommand: apiCommand });
  }

  async setDeviceOpts(valueObj: { [x: string]: any }) {
    const dam = this.isDam();

    // Update aircon_execute_command
    if (valueObj.aircon_execute_command !== undefined) {
      this.log("aircon_execute_command: " + valueObj.aircon_execute_command);
      const cmd = valueObj.aircon_execute_command;
      if (cmd !== 'ON' && cmd !== 'OFF') {
        throw new Error(this.homey.__('errors.command_not_supported', { value: `${cmd}` }));
      }
      await this.sendExecuteCommand(cmd);
    }

    // Update onoff
    if (valueObj.onoff !== undefined) {
      this.log("onoff: " + valueObj.onoff);
      const isOn = (valueObj.onoff === true || valueObj.onoff === 'true');
      await this.sendExecuteCommand(isOn ? 'ON' : 'OFF');
    }

    // Update target_temperature
    if (valueObj.target_temperature !== undefined) {
      this.log("target_temperature: " + valueObj.target_temperature);
      await this.sendCommand({ [dam ? 'targetTemperature' : 'targetTemperatureC']: valueObj.target_temperature });
    }

    // Update aircon_mode
    if (valueObj.aircon_mode !== undefined) {
      this.log("aircon_mode: " + valueObj.aircon_mode);
      const mode = this.toApiMode(valueObj.aircon_mode);
      this.assertCommandSupported('mode', mode);
      await this.sendCommand({ mode });
    }

    // Update fan_mode
    if (valueObj.fan_mode !== undefined) {
      this.log("fan_mode: " + valueObj.fan_mode);
      const property = dam ? 'fanMode' : 'fanSpeedSetting';
      const fanMode = this.toApiFanMode(valueObj.fan_mode);
      this.assertCommandSupported(property, fanMode);
      await this.sendCommand({ [property]: fanMode });
    }
  }

  async updateCapabilityValues(state: any) {
    const props = this.getReportedProps(state);
    if (!props) {
      this.log("Device data is missing or incomplete");
      return;
    }

    try {
      // Classic appliances report e.g. RUNNING / targetTemperatureC / fanSpeedSetting, DAM ones running / targetTemperature / fanMode
      const fanMode = (props.fanSpeedSetting ?? props.fanMode)?.toLowerCase();
      await this.safeUpdateCapabilityValue("onoff", this.compareCaseInsensitiveString(props.applianceState, 'RUNNING'));
      await this.safeUpdateCapabilityValue("target_temperature", props.targetTemperatureC ?? props.targetTemperature);
      await this.safeUpdateCapabilityValue("measure_connectionState", this.translateUnderscore(state.connectionState));
      await this.safeUpdateCapabilityValue("measure_applianceState", this.translateUnderscore(props.applianceState));
      await this.safeUpdateCapabilityValue("measure_applianceMode", this.translateUnderscore(props.applianceMode));
      await this.safeUpdateCapabilityValue("measure_startTime", this.convertSecondsToHrMinString(props.startTime));
      await this.safeUpdateCapabilityValue("measure_stopTime", this.convertSecondsToHrMinString(props.stopTime));
      await this.safeUpdateCapabilityValue("measure_temperature", props.ambientTemperatureC ?? props.temperature);
      await this.safeUpdateCapabilityValue("aircon_mode", props.mode?.toLowerCase());
      await this.safeUpdateCapabilityValue("fan_mode", fanMode === 'medium' ? 'middle' : fanMode);
      await this.safeUpdateCapabilityValue("measure_fanSpeedState", this.translateUnderscore(props.fanSpeedState));

      await this.updateMeasureAlerts(props);
    } catch (error) {
      this.log("Error updating device state: ", error);
    }
  }


  flow_execute_aircon_command(args: { what: string }, state: {}) {
    this.log(`flow_execute_aircon_command: args=${stringify(args.what)} state=${stringify(state)}`);
    return this.setDeviceOpts({ aircon_execute_command: args.what });
  }

  flow_set_aircon_mode(args: { mode: string }, state: {}) {
    this.log(`flow_set_aircon_mode: args=${stringify(args.mode)} state=${stringify(state)}`);
    return this.setDeviceOpts({ aircon_mode: args.mode });
  }

  flow_connectionState_is(args: { value: string }, state: {}) {
    this.log(`flow_connectionState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value, this.getCapabilityValue("measure_connectionState"));
  }

}

module.exports = AirConditionerDevice;
