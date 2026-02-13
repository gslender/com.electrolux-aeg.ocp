import SharedDriver from '../../lib/shared_driver'

export default class LaundryDriver extends SharedDriver {

  static DeviceCapabilities = [
    "onoff",
    "measure_doorState",
    "measure_connectionState",
    "measure_remoteControl",
    "measure_timeToEnd",
    "measure_stopTime",
    "measure_startTime",
    "measure_applianceState",
    "measure_applianceMode", 
    "measure_cyclePhase",
    "measure_alerts"
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }

  async onPairListDevices() {
    return super.getDevicesByType(['WM','TD','WD'],LaundryDriver.DeviceCapabilities);
  }
}

module.exports = LaundryDriver;
