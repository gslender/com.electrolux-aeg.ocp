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

    registerFlowCardAction(cardName: string) {
        const card = this.homey.flow.getActionCard(cardName);
        card.registerRunListener((args, state) => {
          return args.device["flow_" + cardName](args, state);
        });
      }
    
}

module.exports = SharedDriver;
