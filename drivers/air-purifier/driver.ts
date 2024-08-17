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
   
    var devices = [];
    const appliances = await this.app.getAppliancesByTypes([]); // ['AP']); // don't yet know what this would be??
    
    let deviceCapabilities = [];
    for (const cap of AirPurifierDriver.DeviceCapabilities) {
      deviceCapabilities.push(cap); 
    }
    
    for (let i = 0; i < appliances.length; i++) {
      const appliance = appliances[i];
      const device = { 
        name: appliance.applianceData.applianceName,
        data: { id: appliance.applianceId },
        capabilities: deviceCapabilities,
      };
      devices.push(device);
    }

    return devices;
  }

}

module.exports = AirPurifierDriver;
