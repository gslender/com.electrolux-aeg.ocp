import SharedDevice from '../../lib/shared_device';
import HobDriver from './driver';
import stringify from 'json-stringify-safe';

class HobDevice extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = HobDriver.DeviceCapabilities;
    await super.onInit();

    // Listen to multiple capabilities simultaneously / but none exist for this device at the moment, so this is just an example for future capabilities
    // this.registerMultipleCapabilityListener(
    //   [
    //     "onoff",
    //   ],
    //   (valueObj, optsObj) => this.setDeviceOpts(valueObj),
    //   500
    // );
  }

  // async setDeviceOpts(valueObj: { [x: string]: any }) {
  //   const deviceId = this.getData().id;

  //   try {
  //     if (valueObj.onoff !== undefined) {
  //       const isOn = valueObj.onoff === true || valueObj.onoff === 'true';
  //       const command = isOn ? 'START' : 'STOPRESET';
  //       if (this.supportsCommandValue('executeCommand', command)) {
  //         await this.app.sendDeviceCommand(deviceId, { executeCommand: command });
  //       }
  //     }

  //   } catch (error) {
  //     this.log(`Error in setDeviceOpts: ${error}`);
  //   }
  // }

  async updateCapabilityValues(state: any) {
    if (!state.properties || !state.properties.reported) {
      this.log("Device data is missing or incomplete");
      return;
    }

    const props = state.properties.reported;

    try {
      const normalizedState = String(props.applianceState || '').toUpperCase();
      await this.safeUpdateCapabilityValue("measure_connectionState", this.translateUnderscore(state.connectionState));  
      await this.safeUpdateCapabilityValue("measure_applianceState", this.translateUnderscore(props.applianceState));
      await this.updateMeasureAlerts(props);

      this.log("Device data updated");
    } catch (error) {
      this.log("Error updating device state: ", error);
    }

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

module.exports = HobDevice;
