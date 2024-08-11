import SharedDriver from '../../lib/shared_driver'

class UnknownDriver extends SharedDriver {

  async onInit (): Promise<void> {
    super.onInit();
  }
  
  async onPairListDevices() {
   
    var devices = [];
    const appliances = await this.app.getAppliances(); 
    
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

module.exports = UnknownDriver;
