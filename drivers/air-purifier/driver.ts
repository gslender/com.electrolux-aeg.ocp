import Homey from 'homey';
import ElectroluxAEGApp from '../../app'

class AirPurifierDriver extends Homey.Driver {
  app!: ElectroluxAEGApp

  async onInit (): Promise<void> {
    this.app = this.homey.app as ElectroluxAEGApp
  }
  
  registerFlowCardAction(cardName: string) {
    const card = this.homey.flow.getActionCard(cardName);
    card.registerRunListener((args, state) => {
      return args.device["flow_" + cardName](args, state);
    });
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
