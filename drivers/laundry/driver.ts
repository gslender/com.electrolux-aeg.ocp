import SharedDriver from '../../lib/shared_driver'

export default class LaundryDriver extends SharedDriver {

  static DeviceCapabilities = [
    "execute_command",
    "measure_doorState",
    "measure_timeToEnd",
    "measure_stopTime",
    "measure_startTime",
    "measure_applianceState",
    "measure_applianceMode", 
    "measure_cyclePhase" 
  ];

  async onInit (): Promise<void> {
    super.onInit();
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
        for (const cap of LaundryDriver.DeviceCapabilities) {
          deviceCapabilities.push(cap); 
        }
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