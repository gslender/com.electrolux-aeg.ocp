import SharedDriver from '../../lib/shared_driver'

export default class FridgeFreezerDriver extends SharedDriver {

  static DeviceCapabilities = [
// fridge. or freezer. specific capabilities
    "measure_doorState",
    "measure_applianceState",
    "measure_targetTemperature", //targetTemperatureC
    "measure_fanState",
    "measure_alerts",
// non-fridgefreezer specifics
    "measure_energySavingMode",
    "measure_connectionState"
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }
  
  async onPairListDevices() {
    return super.getDevicesByType(['CR'],FridgeFreezerDriver.DeviceCapabilities, ['fridge','freezer']);
  }
}

module.exports = FridgeFreezerDriver;
