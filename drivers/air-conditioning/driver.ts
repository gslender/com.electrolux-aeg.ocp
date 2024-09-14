import SharedDriver from '../../lib/shared_driver'

export default class AirConditionerDriver extends SharedDriver {

  static DeviceCapabilities = [
    "execute_command",
    "measure_connectionState",
    "measure_applianceState",
    "measure_applianceMode", 
    "measure_alerts"
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }

  async onPairListDevices() {
    return super.getDevicesByType(['Azul'],AirConditionerDriver.DeviceCapabilities);
  }

}

module.exports = AirConditionerDriver;