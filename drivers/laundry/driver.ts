import SharedDriver from '../../lib/shared_driver'

class LaundryDriver extends SharedDriver {

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
