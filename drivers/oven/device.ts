import SharedDevice from '../../lib/shared_device';
import OvenDriver from './driver';
import stringify from 'json-stringify-safe';

class OvenDevice extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = OvenDriver.DeviceCapabilities;
    await super.onInit();

    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "LIGHT_onoff",
        "execute_command"
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
        await this.app.sendDeviceCommand(deviceId, { executeCommand: valueObj.execute_command });
      }

      const commandMapping: { [x: string]: string } = {
        LIGHT_onoff: "cavityLight",
      };

      // Update other capabilities
      const capabilitiesToUpdate = [
        "LIGHT_onoff",
      ];

      for (const cap of capabilitiesToUpdate) {
        if (valueObj[cap] !== undefined) {
          const apiCommandName = commandMapping[cap] || cap;

          await this.app.sendDeviceCommand(deviceId, {
            [apiCommandName]: valueObj[cap],
          });
          this.log(`${cap}: ${valueObj[cap]}`);

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
      await this.safeUpdateCapabilityValue("LIGHT_onoff", props.cavityLight);
      await this.safeUpdateCapabilityValue("measure_doorState", this.translate(props.doorState));
      await this.safeUpdateCapabilityValue("measure_connectionState", this.translate(state.connectionState));     
      await this.safeUpdateCapabilityValue("measure_remoteControl", this.translate(props.remoteControl)); 
      await this.safeUpdateCapabilityValue("measure_timeToEnd", this.convertSecondsToMinNumber(props.timeToEnd));
      await this.safeUpdateCapabilityValue("measure_runningTime", this.convertSecondsToMinNumber(props.runningTime));
      await this.safeUpdateCapabilityValue("measure_startTime", this.convertSecondsToHrMinString(props.startTime));
      await this.safeUpdateCapabilityValue("measure_targetTemperature", props.targetTemperatureC);
      await this.safeUpdateCapabilityValue("measure_temperature", props.displayTemperatureC);
      await this.safeUpdateCapabilityValue("measure_applianceState", this.translate(props.applianceState));
      await this.safeUpdateCapabilityValue("measure_applianceMode", this.translate(props.program));
      await this.safeUpdateCapabilityValue("measure_cyclePhase", this.translate(props.processPhase));      
      await this.updateMeasureAlerts(props);

      this.log("Device data updated");
    } catch (error) {
      this.log("Error updating device state: ", error);
    }

  }

  flow_enable_cavity_light(args: {}, state: {}) {
    return this.setDeviceOpts({ LIGHT_onoff: true });
  }

  flow_disable_cavity_light(args: {}, state: {}) {
    return this.setDeviceOpts({ LIGHT_onoff: false });
  }

  flow_execute_command(args: {what: string}, state: {}) {
    return this.setDeviceOpts({ execute_command: args.what });
  }

  flow_cyclePhase_is(args: { value: string }, state: {}) {
    this.log(`flow_cyclePhase_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_cyclePhase"));
  }

  flow_applianceState_is(args: { value: string }, state: {}) {
    this.log(`flow_applianceState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_applianceState"));
  }

  flow_connectionState_is(args: { value: string }, state: {}) {
    this.log(`flow_connectionState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_connectionState"));
  }

  flow_remoteControl_is(args: { value: string }, state: {}) {
    this.log(`flow_remoteControl_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_remoteControl"));
  }
  
}

module.exports = OvenDevice;
