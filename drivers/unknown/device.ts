import SharedDevice from '../../lib/shared_device'

class UnknownDevice extends SharedDevice {

  async onInit() {
    await super.onInit();
  }

}

module.exports = UnknownDevice;
