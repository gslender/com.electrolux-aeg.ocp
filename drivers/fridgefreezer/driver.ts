import SharedDriver from '../../lib/shared_driver'

export default class FridgeFreezerDriver extends SharedDriver {

  static DeviceCapabilities = [
    "execute_command",
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
    return super.getDevicesByType(['CR'],FridgeFreezerDriver.DeviceCapabilities);
  }
}

module.exports = FridgeFreezerDriver;