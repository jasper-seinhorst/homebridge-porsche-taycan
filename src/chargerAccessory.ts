import { Service, PlatformAccessory } from 'homebridge';
import { Vehicle } from './porsche-connect';

import { PorscheTaycanPlatform } from './platform';

export class PorscheChargerAccessory {
  private chargerSensorService: Service;
  private batteryService: Service;
  private vehicle: Vehicle;
  private lowBatteryLevel: number;
  private pollInterval: number;
  private sensorType: 'occupancy' | 'contact';

  constructor(
    private readonly platform: PorscheTaycanPlatform,
    private readonly accessory: PlatformAccessory,

  ) {
    this.vehicle = new Vehicle(this.platform.PorscheConnectAuth, this.accessory.context.device);
    this.lowBatteryLevel = this.platform.config.lowBattery || 35;
    this.pollInterval = this.platform.config.pollInterval || 15;
    this.sensorType = this.platform.config.chargerDevice || 'occupancy';

    if (this.sensorType === 'occupancy') {
      this.chargerSensorService = this.accessory.getService(this.platform.Service.OccupancySensor)
        || this.accessory.addService(this.platform.Service.OccupancySensor);
    } else {
      this.chargerSensorService = this.accessory.getService(this.platform.Service.ContactSensor)
        || this.accessory.addService(this.platform.Service.ContactSensor);
    }
    this.batteryService = this.accessory.getService(this.platform.Service.Battery)
      || this.accessory.addService(this.platform.Service.Battery);

    this.initialise();
  }

  async initialise() {
    // get initial battery state
    this.getBatteryState();

    // refresh state every X minutes
    this.platform.log.debug('Interval battery in minutes ->', this.pollInterval);
    setInterval(() => {
      this.getBatteryState();
    }, (this.pollInterval * 60 * 1000));
  }

  async getBatteryState() {
    this.platform.log.info('Updating Battery Characteristic form Porsche Connect API');
    const emobilityInfo = await this.vehicle.getEmobilityInfo();

    const battery = emobilityInfo.batteryChargeStatus.stateOfChargeInPercentage;
    this.platform.log.debug('Set Characteristic Battery ->', battery);
    this.batteryService.setCharacteristic(this.platform.Characteristic.BatteryLevel, battery);

    const isCharging = emobilityInfo.batteryChargeStatus.chargingState === 'CHARGING';
    this.platform.log.debug('Set Characteristic Charging ->', isCharging);
    if (this.sensorType === 'occupancy') {
      this.chargerSensorService.setCharacteristic(this.platform.Characteristic.OccupancyDetected, isCharging);
    } else {
      this.chargerSensorService.setCharacteristic(this.platform.Characteristic.ContactSensorState, isCharging);
    }
    this.batteryService.setCharacteristic(this.platform.Characteristic.ChargingState, isCharging);

    const isLowBattery = (battery <= this.lowBatteryLevel);
    this.platform.log.debug('Set Characteristic Low Battery ->', isLowBattery);
    this.batteryService.setCharacteristic(this.platform.Characteristic.StatusLowBattery, isLowBattery);
  }

}
