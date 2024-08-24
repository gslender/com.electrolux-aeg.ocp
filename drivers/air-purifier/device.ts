import SharedDevice from '../../lib/shared_device'
import AirPurifierDriver from './driver';

class AirPurifierDevice extends SharedDevice {
  Workmode!: string;

  async onInit() {
    this.deviceCapabilities = AirPurifierDriver.DeviceCapabilities;
    await super.onInit();

    // Listen to multiple capabilities simultaneously
    this.registerMultipleCapabilityListener(
      [
        "onoff",
        "FAN_speed",
        "SMART_mode",
        "IONIZER_onoff",
        "LIGHT_onoff",
        "LOCK_onoff",
      ],
      (valueObj, optsObj) => this.setDeviceOpts(valueObj),
      500
    );

    this.Workmode = '';
  }

  async setDeviceOpts(valueObj: { [x: string]: any }) {
    const deviceId = this.getData().id;

    try {
      // Update WorkMode based on onoff and SMART_mode
      if (valueObj.onoff !== undefined) {
        this.log("onoff: " + valueObj.onoff);
        const workMode = valueObj.onoff
          ? valueObj.SMART_mode === "manual"
            ? "Manual"
            : "Auto"
          : "PowerOff";
        await this.app.sendDeviceCommand(deviceId, { WorkMode: workMode });
        this.log(`WorkMode command sent: ${workMode}`);
      }

      // Update SMART_mode
      if (valueObj.SMART_mode !== undefined && valueObj.onoff === undefined) {
        this.log("SMART_mode: " + valueObj.SMART_mode);
        const workMode = valueObj.SMART_mode === "manual" ? "Manual" : "Auto";
        await this.app.sendDeviceCommand(deviceId, { WorkMode: workMode });
        this.log(`SMART_mode command sent: ${workMode}`);
      }

      const commandMapping: { [x: string]: string } = {
        LIGHT_onoff: "UILight",
        LOCK_onoff: "SafetyLock",
        IONIZER_onoff: "Ionizer",
        FAN_speed: "Fanspeed",
      };

      // Update other capabilities
      const capabilitiesToUpdate = [
        "LIGHT_onoff",
        "LOCK_onoff",
        "IONIZER_onoff",
        "FAN_speed",
      ];
      for (const cap of capabilitiesToUpdate) {
        if (valueObj[cap] !== undefined) {
          const apiCommandName = commandMapping[cap] || cap; // Translates to API command names from homey to electrolux

          if (cap === "FAN_speed") {
            // Check if the device is in 'Smart' mode
            if (this.Workmode === "Smart" && valueObj.FAN_speed) {
              // Send error to user
              // Code unknown
              return;
            } else {
              await this.app.sendDeviceCommand(deviceId, {
                [apiCommandName]: valueObj[cap] / 10,
              });
              this.log(`${cap}: ${valueObj[cap] / 10}`);
            }
          } else {
            await this.app.sendDeviceCommand(deviceId, {
              [apiCommandName]: valueObj[cap],
            });
            this.log(`${cap}: ${valueObj[cap]}`);
          }
        }
      }
    } catch (error) {
      this.log(`Error in setDeviceOpts: ${error}`);
    }
  }

  async updateCapabilityValues(state: any) {
    if (!state.properties || !state.properties.reported) {
      this.log("Device data is missing or incomplete");
      return;
    }

    const props = state.properties.reported;
    this.log("Updating appliance: " + state.applianceId);
    this.Workmode = props.Workmode;

    try {
      await this.safeUpdateCapabilityValue("measure_pm25", props.PM2_5_approximate);
      await this.safeUpdateCapabilityValue("measure_voc", props.TVOC);
      await this.safeUpdateCapabilityValue("measure_co2", props.ECO2);
      await this.safeUpdateCapabilityValue("measure_humidity", props.Humidity);
      await this.safeUpdateCapabilityValue("measure_pm25", props.PM2_5);
      await this.safeUpdateCapabilityValue("measure_pm10", props.PM10);
      await this.safeUpdateCapabilityValue("measure_pm1", props.PM1);
      await this.safeUpdateCapabilityValue("measure_temperature", props.Temp);
      await this.safeUpdateCapabilityValue("measure_filter", props.FilterLife);    
      await this.updateMeasureAlerts(props);
      this.log("Device data updated");
    } catch (error) {
      this.log("Error updating device state: ", error);
    }

    if (props.Workmode === "Auto" || props.Workmode === "Smart") {
      this.safeUpdateCapabilityValue("onoff", true);
      this.safeUpdateCapabilityValue("SMART_mode", "smart");
      this.safeUpdateCapabilityValue("FAN_speed", 10.0 * (props.Fanspeed + 1));
    } else if (props.Workmode === "Manual") {
      this.safeUpdateCapabilityValue("onoff", true);
      this.safeUpdateCapabilityValue("SMART_mode", "manual");
      this.safeUpdateCapabilityValue("FAN_speed", 10.0 * (props.Fanspeed + 1));
    } else if (props.Workmode === "Quiet") {
      this.safeUpdateCapabilityValue("onoff", true);
      this.safeUpdateCapabilityValue("SMART_mode", "quiet");
      this.safeUpdateCapabilityValue("FAN_speed", 10.0 * (props.Fanspeed + 1));
    } else {
      this.safeUpdateCapabilityValue("onoff", false);
      this.safeUpdateCapabilityValue("FAN_speed", 0);
    }

    this.safeUpdateCapabilityValue("IONIZER_onoff", Boolean(props.Ionizer));
    this.safeUpdateCapabilityValue("LIGHT_onoff", Boolean(props.UILight));
    this.safeUpdateCapabilityValue("LOCK_onoff", Boolean(props.SafetyLock));
  }

  flow_set_fan_speed(args: { fan_speed: number }, state: {}) {
    return this.setDeviceOpts({ FAN_speed: args.fan_speed });
  }

  flow_enable_manual_mode(args: {}, state: {}) {
    return this.setDeviceOpts({ SMART_mode: "manual" });
  }

  flow_enable_smart_mode(args: {}, state: {}) {
    return this.setDeviceOpts({ SMART_mode: "smart" });
  }

  flow_enable_ionizer(args: {}, state: {}) {
    return this.setDeviceOpts({ IONIZER_onoff: true });
  }

  flow_disable_ionizer(args: {}, state: {}) {
    return this.setDeviceOpts({ IONIZER_onoff: false });
  }

  flow_enable_indicator_light(args: {}, state: {}) {
    return this.setDeviceOpts({ LIGHT_onoff: true });
  }

  flow_disable_indicator_light(args: {}, state: {}) {
    return this.setDeviceOpts({ LIGHT_onoff: false });
  }

  flow_enable_lock(args: {}, state: {}) {
    return this.setDeviceOpts({ LOCK_onoff: true });
  }

  flow_disable_lock(args: {}, state: {}) {
    return this.setDeviceOpts({ LOCK_onoff: false });
  }
}

module.exports = AirPurifierDevice;
