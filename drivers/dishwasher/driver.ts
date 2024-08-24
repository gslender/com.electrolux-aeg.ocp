import SharedDriver from '../../lib/shared_driver'

export default class DishwasherDriver extends SharedDriver {

  static DeviceCapabilities = [
    "execute_command",
    "measure_doorState",
    "measure_timeToEnd",
    "measure_startTime",
    "measure_applianceState",
    "measure_applianceMode", 
    "measure_cyclePhase",
    "measure_rinseAidLevel",
    "measure_alerts"
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }

  async onPairListDevices() {
    return super.getDevicesByType(['DW'],DishwasherDriver.DeviceCapabilities);
  }

}

module.exports = DishwasherDriver;