import { Service, PlatformAccessory, PlatformConfig, Logger, API, Characteristic } from 'homebridge';
import { PorscheAccessory } from './PlatformTypes';

export class PorscheChargerAccessory implements PorscheAccessory {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private chargerService: Service;
  private batteryService: Service;
  private batteryLevel = 100;
  private lowBatteryLevel: number;
  private isLowBatteryLevel = false;
  private isCharging = false;
  private sensorType: 'occupancy' | 'contact';

  constructor(public config: PlatformConfig, public readonly log: Logger, public readonly api: API, public accessory: PlatformAccessory) {
    this.lowBatteryLevel = this.config.lowBattery || 35;
    this.sensorType = this.config.chargerDevice || 'occupancy';
    this.chargerService = this.accessory.getService(this.sensorType === 'occupancy' ? this.Service.OccupancySensor : this.Service.ContactSensor)
      || this.accessory.addService(this.sensorType === 'occupancy' ? this.Service.OccupancySensor : this.Service.ContactSensor);
    this.batteryService = this.accessory.getService(this.Service.Battery) || this.accessory.addService(this.Service.Battery);
  }

  public update(emobilityInfo) {
    // Battery level
    const newBatteryLevel = emobilityInfo.batteryChargeStatus.stateOfChargeInPercentage;
    if (newBatteryLevel !== this.batteryLevel) {
      this.batteryLevel = newBatteryLevel;
      this.batteryService.setCharacteristic(this.Characteristic.BatteryLevel, newBatteryLevel);
      this.log.info('Update battery level', newBatteryLevel);
    }

    // Is battery low state
    const isLowBatteryLevel = (this.batteryLevel <= this.lowBatteryLevel);
    this.batteryService.setCharacteristic(this.Characteristic.StatusLowBattery, isLowBatteryLevel);
    if (isLowBatteryLevel !== this.isLowBatteryLevel) {
      this.isLowBatteryLevel = isLowBatteryLevel;
      this.log.info('Update low battery level state', isLowBatteryLevel);
    }

    // Charging state
    const isCharging = emobilityInfo.batteryChargeStatus.chargingState === 'CHARGING';
    this.chargerService.setCharacteristic(this.sensorType === 'occupancy' ? this.Characteristic.OccupancyDetected : this.Characteristic.ContactSensorState, isCharging);
    this.batteryService.setCharacteristic(this.Characteristic.ChargingState, isCharging);
    if (isCharging !== this.isCharging) {
      this.isCharging = isCharging;
      this.log.info('Update charging state', isCharging);
    }
  }
}
