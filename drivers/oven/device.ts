import SharedDevice from '../../lib/shared_device';
import OvenDriver from './driver';
import stringify from 'json-stringify-safe';

class OvenDevice extends SharedDevice {

  async onInit() {
    this.deviceCapabilities = OvenDriver.DeviceCapabilities;
    await super.onInit();

    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "onoff",
        "oven_execute_command",
        "LIGHT_onoff",
      ],
      (valueObj, optsObj) => this.setDeviceOpts(valueObj),
      500
    );
  }

  async setDeviceOpts(valueObj: { [x: string]: any }) {
    try {
      if (valueObj.onoff !== undefined) {
        const isOn = valueObj.onoff === true || valueObj.onoff === 'true';
        const command = isOn ? 'START' : 'STOPRESET';
        this.assertCommandSupported('executeCommand', command);
        await this.sendCommand({ executeCommand: command });
      }

      // Update oven_execute_command
      if (valueObj.oven_execute_command !== undefined) {
        this.log("oven_execute_command: " + valueObj.oven_execute_command);
        this.assertCommandSupported('executeCommand', valueObj.oven_execute_command);
        await this.sendCommand({ executeCommand: valueObj.oven_execute_command });
      }

      const commandMapping: { [x: string]: string } = {
        LIGHT_onoff: "cavityLight",
      };

      // Update other capabilities
      const capabilitiesToUpdate = [
        "LIGHT_onoff",
      ];

      for (const cap of capabilitiesToUpdate) {
        if (valueObj[cap] !== undefined) {
          const apiCommandName = commandMapping[cap] || cap;

          await this.sendCommand({
            [apiCommandName]: valueObj[cap],
          });
          this.log(`${cap}: ${valueObj[cap]}`);

        }
      }
    } catch (error) {
      this.log(`Error in setDeviceOpts: ${error}`);
      throw error;
    }
  }

  async updateCapabilityValues(state: any) {
    if (!state.properties || !state.properties.reported) {
      this.log("Device data is missing or incomplete");
      return;
    }

    const props = this.getOvenProps(this.getReportedProps(state));

    try {
      const normalizedState = String(props.applianceState || '').toUpperCase();
      const isOn = normalizedState !== '' && !['IDLE', 'OFF', 'END_OF_CYCLE'].includes(normalizedState);
      await this.safeUpdateCapabilityValue("onoff", isOn);
      await this.safeUpdateCapabilityValue("LIGHT_onoff", props.cavityLight);
      await this.safeUpdateCapabilityValue("measure_doorState", this.translateUnderscore(props.doorState));
      await this.safeUpdateCapabilityValue("measure_connectionState", this.translateUnderscore(state.connectionState));     
      await this.safeUpdateCapabilityValue("measure_remoteControl", this.translateUnderscore(props.remoteControl)); 
      await this.safeUpdateCapabilityValue("measure_timeToEnd", this.convertSecondsToMinNumber(props.timeToEnd));
      await this.safeUpdateCapabilityValue("measure_runningTime", this.convertSecondsToMinNumber(props.runningTime));
      await this.safeUpdateCapabilityValue("measure_startTime", this.convertSecondsToHrMinString(props.startTime));
      await this.safeUpdateCapabilityValue("measure_targetTemperature", props.targetTemperatureC);
      await this.safeUpdateCapabilityValue("measure_temperature", props.displayTemperatureC);
      await this.safeUpdateCapabilityValue("measure_applianceState", this.translateUnderscore(props.applianceState));
      await this.safeUpdateCapabilityValue("measure_applianceMode", this.translateUnderscore(props.program));
      await this.safeUpdateCapabilityValue("measure_cyclePhase", this.translateUnderscore(props.processPhase));
      // Not every oven reports these (e.g. no steam or food probe), leave them empty then
      await this.safeUpdateCapabilityValue("measure_preheatComplete", this.translateOptional(props.preheatComplete));
      await this.safeUpdateCapabilityValue("measure_waterTankLevel", this.translateOptional(props.waterTankLevel));
      await this.safeUpdateCapabilityValue("measure_foodProbeState", this.translateOptional(props.foodProbeInsertionState));
      await this.updateMeasureAlerts(props);

      this.log("Device data updated");
    } catch (error) {
      this.log("Error updating device state: ", error);
    }

  }

  /**
   * Many ovens report their cavity properties (temperatures, door, timers, program, light) nested under
   * the cavity, e.g. { applianceState, remoteControl, upperOven: { displayTemperatureC, doorState, ... } }.
   * Lift those to the root so they are read like on ovens that report them flat. Properties already at the
   * root win, so ovens with a flat layout behave exactly as before.
   */
  protected getOvenProps(props: any): any {
    const cavity = this.findCavity(props);
    if (!cavity) return props;
    return { ...cavity, ...props };
  }

  /**
   * The object an oven nests its cavity properties under: upperOven on most, else the group its capabilities
   * put cavityLight/temperatures under, else any reported object holding typical cavity properties.
   */
  private findCavity(props: any): any {
    if (!props || typeof props !== 'object') return undefined;
    const isObject = (value: any) => !!value && typeof value === 'object' && !Array.isArray(value);
    const candidates = [
      'upperOven',
      this.findApplianceCapability('cavityLight')?.namespace,
      this.findApplianceCapability('targetTemperatureC')?.namespace,
      this.findApplianceCapability('displayTemperatureC')?.namespace,
    ];
    for (const name of candidates) {
      const key = name ? this.findKey(props, name) : undefined;
      if (key && isObject(props[key])) return props[key];
    }
    const cavityKeys = ['cavityLight', 'displayTemperatureC', 'targetTemperatureC', 'doorState'];
    return Object.values(props).find(value => isObject(value) && cavityKeys.some(key => key in (value as any)));
  }

  /** Like translateUnderscore, but keeps a property the oven doesn't report undefined, so its capability isn't set. */
  private translateOptional(input: any): string | undefined {
    return typeof input === 'string' ? this.translateUnderscore(input) : undefined;
  }

  flow_enable_cavity_light(args: {}, state: {}) {
    return this.setDeviceOpts({ LIGHT_onoff: true });
  }

  flow_disable_cavity_light(args: {}, state: {}) {
    return this.setDeviceOpts({ LIGHT_onoff: false });
  }

  flow_execute_oven_command(args: { what: string }, state: {}) {
    return this.setDeviceOpts({ oven_execute_command: args.what });
  }

  flow_cyclePhase_is(args: { value: string }, state: {}) {
    this.log(`flow_cyclePhase_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_cyclePhase"));
  }

  flow_connectionState_is(args: { value: string }, state: {}) {
    this.log(`flow_connectionState_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_connectionState"));
  }

  flow_remoteControl_is(args: { value: string }, state: {}) {
    this.log(`flow_remoteControl_is: args=${stringify(args.value)} state=${stringify(state)}`);
    return this.compareCaseInsensitiveString(args.value,this.getCapabilityValue("measure_remoteControl"));
  }
  
}

module.exports = OvenDevice;
