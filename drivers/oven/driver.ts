import SharedDriver from '../../lib/shared_driver'

export default class OvenDriver extends SharedDriver {

  static DeviceCapabilities = [
    "execute_command",
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
    return super.getDevicesByType(['OV'],OvenDriver.DeviceCapabilities);
  }
  /*
  async onPairListDevices() {
   
    var devices = [];
    const appliances = await this.app.getAppliances(); 
    
    for (let i = 0; i < appliances.length; i++) {
      const appliance = appliances[i];     
      let deviceCapabilities = [];
      if (appliance.properties?.reported?.applianceInfo?.applianceType === 'OV') {
        for (const cap of OvenDriver.DeviceCapabilities) {
          deviceCapabilities.push(cap); 
        }
      }
      
      const device = { 
        name: appliance.applianceData.applianceName,
        data: { id: appliance.applianceId },
        capabilities: deviceCapabilities,
      };
      devices.push(device);
    }

    return devices;
  }*/

}

module.exports = OvenDriver;