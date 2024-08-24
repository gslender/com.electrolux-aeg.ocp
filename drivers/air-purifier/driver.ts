import SharedDriver from '../../lib/shared_driver'

export default class AirPurifierDriver extends SharedDriver {
  static DeviceCapabilities = [
    "measure_co2",
    "measure_humidity",
    "measure_pm25",
    "measure_pm10",
    "measure_pm1",
    "measure_temperature",
    "measure_voc",
    "measure_connectionState",
    "onoff",
    "SMART_mode",
    "FAN_speed",
    "IONIZER_onoff",
    "LOCK_onoff",
    "LIGHT_onoff",
    "measure_filter",
    "measure_alerts"
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }

  async onPairListDevices() {
    return super.getDevicesByType(['PURE','Muju'],AirPurifierDriver.DeviceCapabilities);
  }
}

module.exports = AirPurifierDriver;
