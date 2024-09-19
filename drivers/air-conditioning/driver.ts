import SharedDriver from '../../lib/shared_driver'

export default class AirConditionerDriver extends SharedDriver {

  static DeviceCapabilities = [
    "onoff",
    "measure_connectionState",
    "measure_applianceState",
    "measure_applianceMode", 
    "measure_startTime",
    "measure_stopTime",
    "target_temperature",
    "fan_mode",
    "thermostat_mode",
    "measure_temperature",
    "measure_alerts",
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }

  async onPairListDevices() {
    return super.getDevicesByType(['Azul'],AirConditionerDriver.DeviceCapabilities);
  }

}

module.exports = AirConditionerDriver;