import SharedDriver from '../../lib/shared_driver'

export default class OvenDriver extends SharedDriver {

  static DeviceCapabilities = [
    "onoff",
    "LIGHT_onoff",
    "measure_doorState",
    "measure_connectionState",
    "measure_remoteControl",
    "measure_timeToEnd",
    "measure_runningTime",
    "measure_startTime",
    "measure_targetTemperature", //targetTemperatureC
    "measure_temperature", //displayTemperatureC
    "measure_applianceState",
    "measure_applianceMode", //program
    "measure_cyclePhase", //processPhase
    "measure_alerts"
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }
  
  async onPairListDevices() {
    return super.getDevicesByType(['OV','SO'],OvenDriver.DeviceCapabilities);
  }

}

module.exports = OvenDriver;
