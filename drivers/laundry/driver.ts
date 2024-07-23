import Homey from 'homey';
import ElectroluxAEGApp from '../../app'

class LaundryDriver extends Homey.Driver {
  app!: ElectroluxAEGApp

  async onInit (): Promise<void> {
    this.app = this.homey.app as ElectroluxAEGApp

    this.registerFlowCardAction("execute_command");
  }
  
  registerFlowCardAction(cardName: string) {
    const card = this.homey.flow.getActionCard(cardName);
    card.registerRunListener((args, state) => {
      return args.device["flow_" + cardName](args, state);
    });
  }

  async onPairListDevices() {
   
    var devices = [];
    const appliances = await this.app.getAppliances(); 
    
    for (let i = 0; i < appliances.length; i++) {
      const appliance = appliances[i];     
      let deviceCapabilities = [];
      if (appliance.properties?.reported?.applianceInfo?.applianceType === 'WM' ||
        appliance.properties?.reported?.applianceInfo?.applianceType === 'TD') {
        //washer or dryer
        deviceCapabilities.push("execute_command"); 
        deviceCapabilities.push("measure_doorState");
        deviceCapabilities.push("measure_timeToEnd");
        deviceCapabilities.push("measure_stopTime");
        deviceCapabilities.push("measure_startTime");
        deviceCapabilities.push("measure_applianceState");
        deviceCapabilities.push("measure_applianceMode");    
        deviceCapabilities.push("measure_cyclePhase");              
      }
      
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

module.exports = LaundryDriver;
