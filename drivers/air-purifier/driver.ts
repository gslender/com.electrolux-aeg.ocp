import Homey from 'homey';
import ElectroluxAEGApp from '../../app'

class AirPurifierDriver extends Homey.Driver {
  app!: ElectroluxAEGApp

  async onInit (): Promise<void> {
    this.app = this.homey.app as ElectroluxAEGApp

    this.registerFlowCardAction("set_fan_speed");
    this.registerFlowCardAction("enable_smart_mode");
    this.registerFlowCardAction("enable_manual_mode");
    this.registerFlowCardAction("enable_ionizer");
    this.registerFlowCardAction("disable_ionizer");
    this.registerFlowCardAction("enable_lock");
    this.registerFlowCardAction("disable_lock");
    this.registerFlowCardAction("enable_indicator_light");
    this.registerFlowCardAction("disable_indicator_light");
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
