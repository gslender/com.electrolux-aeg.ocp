import SharedDriver from '../../lib/shared_driver'

class AirPurifierDriver extends SharedDriver {

  async onInit (): Promise<void> {
    super.onInit();
  }
  
  async onPairListDevices() {
   
    var devices = [];
    const appliances = await this.app.getAppliancesByTypes([]); // ['AP']); // don't yet know what this would be??
    for (let i = 0; i < appliances.length; i++) {
      const appliance = appliances[i];
      const device = { 
        name: appliance.applianceData.applianceName,
        data: { id: appliance.applianceId } 
      };
      devices.push(device);
    }

    return devices;
  }

}

module.exports = AirPurifierDriver;
