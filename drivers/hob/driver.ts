import SharedDriver from '../../lib/shared_driver'

export default class HobDriver extends SharedDriver {

  static DeviceCapabilities = [
    "measure_connectionState",
    "measure_applianceState",
    "measure_alerts"
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }
  
  async onPairListDevices() {
    return super.getDevicesByType(['HB'],HobDriver.DeviceCapabilities);
  }

}

module.exports = HobDriver;
