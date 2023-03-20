import { Service, PlatformAccessory, PlatformConfig, Logger, API, Characteristic } from 'homebridge';
import { PorscheAccessory } from './PlatformTypes';

export class PorscheChargerAccessory implements PorscheAccessory {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private chargerSensorService: Service;
  private batteryService: Service;
  private lowBatteryLevel: number;
  private sensorType: 'occupancy' | 'contact';

  constructor(public config: PlatformConfig, public readonly log: Logger, public readonly api: API, public accessory: PlatformAccessory) {
    this.lowBatteryLevel = this.config.lowBattery || 35;
    this.sensorType = this.config.chargerDevice || 'occupancy';

    if (this.sensorType === 'occupancy') {
      this.chargerSensorService = this.accessory.getService(this.Service.OccupancySensor)
        || this.accessory.addService(this.Service.OccupancySensor);
    } else {
      this.chargerSensorService = this.accessory.getService(this.Service.ContactSensor)
        || this.accessory.addService(this.Service.ContactSensor);
    }
    this.batteryService = this.accessory.getService(this.Service.Battery)
      || this.accessory.addService(this.Service.Battery);
  }

  public update(emobilityInfo) {
    const battery = emobilityInfo.batteryChargeStatus.stateOfChargeInPercentage;
    this.log.debug('Set Characteristic Battery ->', battery);
    this.batteryService.setCharacteristic(this.Characteristic.BatteryLevel, battery);

    const isCharging = emobilityInfo.batteryChargeStatus.chargingState === 'CHARGING';
    this.log.debug('Set Characteristic Charging ->', isCharging);
    if (this.sensorType === 'occupancy') {
      this.chargerSensorService.setCharacteristic(this.Characteristic.OccupancyDetected, isCharging);
    } else {
      this.chargerSensorService.setCharacteristic(this.Characteristic.ContactSensorState, isCharging);
    }
    this.batteryService.setCharacteristic(this.Characteristic.ChargingState, isCharging);

    const isLowBattery = (battery <= this.lowBatteryLevel);
    this.log.debug('Set Characteristic Low Battery ->', isLowBattery);
    this.batteryService.setCharacteristic(this.Characteristic.StatusLowBattery, isLowBattery);
  }
}
