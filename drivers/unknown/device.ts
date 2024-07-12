import Homey from 'homey';
import ElectroluxAEGApp from '../../app'
import stringify from 'json-stringify-safe';


class UnknownDevice extends Homey.Device {
  app!: ElectroluxAEGApp

  async onInit() {
    this.log('UknownDevice has been initialized');
    this.app = this.homey.app as ElectroluxAEGApp
    const deviceId = this.getData().id;
    const state = await this.app.getApplianceState(deviceId);

    this.log('********* applianceState ********');
    this.log(stringify(state));
    this.log('**********************************');

    const capabilities = await this.app.getApplianceCapabilities(deviceId);
    this.log(`********** capabilities **********`);
    this.log(stringify(capabilities));
    this.log('**********************************');
  }

  async updateCapabilityValues(state: any) {
  }


}

module.exports = UnknownDevice;
