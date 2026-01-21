import Homey from 'homey';
import PairSession from 'homey/lib/PairSession';
import ElectroluxAEGApp from '../app'

export default class SharedDriver extends Homey.Driver {
  app!: ElectroluxAEGApp

  async onInit() {
    this.app = this.homey.app as ElectroluxAEGApp;
  }

  async onPairListDevices(): Promise<any[]> {
    return [];
  }

  async getDevicesByType(queryTypes: string[], capabilities: string[], subtypes?: string[]) {
    var devices = [];
    const appliances = await this.app.getAppliances();

    const hasSubtypes = Array.isArray(subtypes) && subtypes.length > 0;

    for (let i = 0; i < appliances.length; i++) {
      const appliance = appliances[i];
      for (let queryType of queryTypes) {
        const applianceType = appliance.applianceData?.modelName;
        if (applianceType === undefined || applianceType === null) continue;
        // const applianceType = appliance.properties?.reported?.applianceInfo?.applianceType;
        this.log(`applianceType=${applianceType} queryType=${queryType} applianceType.includes(queryType)=${applianceType.includes(queryType)}`);
        if (typeof applianceType === 'string' && applianceType.includes(queryType)) {
          let deviceCapabilities = [];
          for (const cap of capabilities) {
            deviceCapabilities.push(cap);
          }

          if (hasSubtypes) {
            for (const subtype of subtypes ?? []) {
              const formattedSubtype = subtype.charAt(0).toUpperCase() + subtype.slice(1);
              const device = {
                name: formattedSubtype,
                data: { id: appliance.applianceId, subtype: subtype },
                capabilities: deviceCapabilities,
              };
              devices.push(device);
            }
          } else {
            const device = {
              name: appliance.applianceData.applianceName,
              data: { id: appliance.applianceId },
              capabilities: deviceCapabilities,
            };
            devices.push(device);
          }
        }
      }
    }
    return devices;
  }

  registerFlowCardAction(cardName: string) {
    const card = this.homey.flow.getActionCard(cardName);
    card.registerRunListener((args, state) => {
      return args.device["flow_" + cardName](args, state);
    });
  }

}

module.exports = SharedDriver;
