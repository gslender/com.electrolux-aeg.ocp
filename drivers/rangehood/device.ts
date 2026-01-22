import SharedDevice from '../../lib/shared_device';
import RangeHoodDriver from './driver';
import stringify from 'json-stringify-safe';

class RangeHoodDevice extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = RangeHoodDriver.DeviceCapabilities;
    await super.onInit();

    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "onoff",
        "hoodFanLevel",
        "hoodLightIntensity",
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
      await this.safeUpdateCapabilityValue("onoff", props.hoodFanLevel !== "OFF" || props.lightIntensity > 0);
      await this.safeUpdateCapabilityValue("hoodFanLevel", props.hoodFanLevel);
      await this.safeUpdateCapabilityValue("hoodLightIntensity", props.lightIntensity);
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
