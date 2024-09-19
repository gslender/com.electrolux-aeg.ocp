import SharedDriver from '../../lib/shared_driver'

export default class RobotDriver extends SharedDriver {

  static DeviceCapabilities = [
    "execute_command",
    "measure_battery", 
    "measure_applianceState", 
    "power_mode", 
    "measure_alerts" 
  ];

  async onInit (): Promise<void> {
    super.onInit();
  }

  async onPairListDevices() {
    return super.getDevicesByType(['PUREi9'],RobotDriver.DeviceCapabilities);
  }

}

module.exports = RobotDriver;


/* 

class RobotStates(Enum):
    Cleaning = 1
    Paused_Cleaning = 2
    Spot_Cleaning = 3
    Paused_Spot_Cleaning = 4
    Return = 5
    Paused_Return = 6
    Return_for_Pitstop = 7
    Paused_Return_for_Pitstop = 8
    Charging = 9
    Sleeping = 10
    Error = 11
    Pitstop = 12
    Manual_Steering = 13
    Firmware_Upgrade = 14

class PowerMode(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
*/