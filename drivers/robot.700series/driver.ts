import SharedDriver from '../../lib/shared_driver'

export default class Robot700Driver extends SharedDriver {

  static DeviceCapabilities = [
    "onoff",
    "cleaning_command",
    "vacuum_mode",
    "measure_battery", 
    "measure_applianceState", 
    "measure_applianceMode"
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }

  async onPairListDevices() {
    return super.getDevicesByType(['700series'],Robot700Driver.DeviceCapabilities);
  }

}

module.exports = Robot700Driver;
