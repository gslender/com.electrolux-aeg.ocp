import SharedDriver from '../../lib/shared_driver'

export default class RangeHoodDriver extends SharedDriver {

  static DeviceCapabilities = [
    "onoff",
    "hoodFanLevel",
    "hoodLightIntensity",
    "measure_connectionState",
    "measure_applianceState",
    "measure_applianceMode", //program
    "measure_alerts"
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }
  
  async onPairListDevices() {
    return super.getDevicesByType(['HD'],RangeHoodDriver.DeviceCapabilities);
  }

}

module.exports = RangeHoodDriver;