import SharedDevice from '../../lib/shared_device';
import AirConditionerDriver from './driver';
import stringify from 'json-stringify-safe';

class AirConditionerDevice extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = AirConditionerDriver.DeviceCapabilities;
    await super.onInit();
    
    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "onoff","target_temperature"
      ],
      (valueObj, optsObj) => this.setDeviceOpts(valueObj),
      500
    );
  }

  async setDeviceOpts(valueObj: { [x: string]: any }) {
    const deviceId = this.getData().id;

    try {

      // Update onoff
      if (valueObj.onoff !== undefined) {
        this.log("onoff: " + valueObj.onoff);
        await this.app.sendDeviceCommand(deviceId, { executeCommand: valueObj.onoff });
      }

      // Update target_temperature
      if (valueObj.target_temperature !== undefined) {
        this.log("target_temperature: " + valueObj.target_temperature);
        await this.app.sendDeviceCommand(deviceId, { targetTemperatureC: valueObj.target_temperature });
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
      await this.safeUpdateCapabilityValue("onoff", props.applianceState === 'RUNNING');
      await this.safeUpdateCapabilityValue("target_temperature", props.targetTemperatureC); 
      await this.safeUpdateCapabilityValue("measure_connectionState", this.translate(state.connectionState));       
      await this.safeUpdateCapabilityValue("measure_applianceState", this.translate(props.applianceState));
      await this.safeUpdateCapabilityValue("measure_applianceMode", this.translate(props.applianceMode));
      await this.safeUpdateCapabilityValue("measure_startTime", this.convertSecondsToHrMinString(props.startTime));
      await this.safeUpdateCapabilityValue("measure_stopTime", this.convertSecondsToHrMinString(props.stopTime)); 
      await this.safeUpdateCapabilityValue("measure_temperature", props.ambientTemperatureC); 
      await this.safeUpdateCapabilityValue("thermostat_mode", props.mode); 
      await this.safeUpdateCapabilityValue("fan_mode", props.fanSpeedSetting); 

      await this.updateMeasureAlerts(props);
    } catch (error) {
      this.log("Error updating device state: ", error);
    }
  }


  flow_execute_command(args: { what: string }, state: {}) {
    this.log(`flow_execute_command: args=${stringify( args.what)} state=${stringify(state)}`);
    return this.setDeviceOpts({ execute_command: args.what });
  }


  flow_applianceState_is(args: { value: string }, state: {}) {
    this.log(`flow_applianceState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_applianceState"));
  }

}

module.exports = AirConditionerDevice;
