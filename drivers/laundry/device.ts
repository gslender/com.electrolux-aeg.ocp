import SharedDevice from '../../lib/shared_device';
import LaundyDriver from './driver';
import stringify from 'json-stringify-safe';

class LaundryDevice extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = LaundyDriver.DeviceCapabilities;
    super.onInit();
    
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
    const deviceId = this.getData().id;

    try {

      // Update execute_command
      if (valueObj.execute_command !== undefined) {
        this.log("execute_command: " + valueObj.execute_command);
        await this.app.sendDeviceCommand(deviceId, { executeCommand: valueObj.execute_command });
      }

      /*
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
      */

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
      await this.setCapabilityValue("measure_doorState", this.toTitleCase(props.doorState));
      await this.setCapabilityValue("measure_timeToEnd", this.convertSecondsToMinNumber(props.timeToEnd));
      await this.setCapabilityValue("measure_stopTime", this.convertSecondsToHrMinString(props.stopTime)); // in seconds 
      await this.setCapabilityValue("measure_startTime", this.convertSecondsToHrMinString(props.startTime));
      await this.setCapabilityValue("measure_applianceState", this.toTitleCase(props.applianceState));
      await this.setCapabilityValue("measure_applianceMode", this.toTitleCase(props.applianceMode));
      await this.setCapabilityValue("measure_cyclePhase", this.toTitleCase(props.cyclePhase));
    } catch (error) {
      this.log("Error updating device state: ", error);
    }
  }


  flow_execute_command(args: { what: string }, state: {}) {
    this.log(`flow_cyclePhase_is: args=${stringify( args.what)} state=${stringify(state)}`);
    return this.setDeviceOpts({ execute_command: args.what });
  }

  flow_cyclePhase_is(args: { value: string }, state: {}) {
    this.log(`flow_cyclePhase_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return args.value === this.getCapabilityValue("measure_cyclePhase");
  }

  flow_applianceState_is(args: { value: string }, state: {}) {
    this.log(`flow_applianceState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return args.value === this.getCapabilityValue("measure_applianceState");
  }
}

module.exports = LaundryDevice;
