import SharedDevice from '../../lib/shared_device';
import OvenDriver from './driver';

class OvenDevice extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = OvenDriver.DeviceCapabilities;
    super.onInit();

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
      await this.setCapabilityValue("LIGHT_onoff", props.cavityLight);
      await this.setCapabilityValue("measure_doorState", this.toTitleCase(props.doorState));
      await this.setCapabilityValue("measure_timeToEnd", this.convertSecondsToMinNumber(props.timeToEnd));
      await this.setCapabilityValue("measure_runningTime", this.convertSecondsToMinNumber(props.runningTime));
      await this.setCapabilityValue("measure_startTime", this.convertSecondsToHrMinString(props.startTime));
      await this.setCapabilityValue("measure_targetTemperature", props.targetTemperatureC);
      await this.setCapabilityValue("measure_temperature", props.displayTemperatureC);
      await this.setCapabilityValue("measure_applianceState", this.toTitleCase(props.applianceState));
      await this.setCapabilityValue("measure_applianceMode", this.toTitleCase(props.program));
      await this.setCapabilityValue("measure_cyclePhase", this.toTitleCase(props.processPhase));      
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
  
}

module.exports = OvenDevice;
