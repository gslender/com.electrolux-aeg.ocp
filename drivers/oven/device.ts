import Homey from 'homey';
import ElectroluxAEGApp from '../../app'
import stringify from 'json-stringify-safe';


class OvenDevice extends Homey.Device {
  app!: ElectroluxAEGApp

  async onInit() {
    this.log('OvenDevice has been initialized');
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
    if (!state.properties || !state.properties.reported) {
      this.log("Device data is missing or incomplete");
      return;
    }

    const props = state.properties.reported;

    try {
      await this.setCapabilityValue("measure_doorState", props.doorState);
      await this.setCapabilityValue("measure_timeToEnd", this.convertSecondsToHrMin(props.runningTime));
      await this.setCapabilityValue("measure_stopTime", this.convertSecondsToHrMin(props.timeToEnd)); // in seconds 
      await this.setCapabilityValue("measure_startTime", this.convertSecondsToHrMin(props.startTime));
      await this.setCapabilityValue("measure_targetTemperature", props.targetTemperatureC);
      await this.setCapabilityValue("measure_temperature", props.displayTemperatureC);
      await this.setCapabilityValue("measure_applianceState", props.applianceState);
      await this.setCapabilityValue("measure_applianceMode", props.program);
      await this.setCapabilityValue("measure_cyclePhase", props.processPhase);

      this.log("Device data updated");
    } catch (error) {
      this.log("Error updating device state: ", error);
    }

  }

  convertSecondsToHrMin(seconds: number) {
    if (seconds < 0) return '';
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    // Format the time into 24-hour format (HH:MM:SS)
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    if (hours < 1) {
      if (minutes < 2) return `${minutes} minute`;
      return `${minutes} minutes`;
    }

    return `${formattedHours}:${formattedMinutes}`;
  }
}

module.exports = OvenDevice;
