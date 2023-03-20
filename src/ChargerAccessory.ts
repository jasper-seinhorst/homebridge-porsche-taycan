import { Service, PlatformAccessory, PlatformConfig, Logger, API, Characteristic } from 'homebridge';
import { PorscheAccessory } from './PlatformTypes';

export class PorscheChargerAccessory implements PorscheAccessory {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private chargerSensorService: Service;
  private batteryService: Service;
  private batteryLevel = 100;
  private lowBatteryLevel: number;
  private isLowBatteryLevel = false;
  private isCharging = false;
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
    if (this.sensorType === 'occupancy') {
      this.chargerSensorService.setCharacteristic(this.Characteristic.OccupancyDetected, isCharging);
    } else {
      this.chargerSensorService.setCharacteristic(this.Characteristic.ContactSensorState, isCharging);
    }
    this.batteryService.setCharacteristic(this.Characteristic.ChargingState, isCharging);
    if (isCharging !== this.isCharging) {
      this.isCharging = isCharging;
      this.log.info('Update charging state', isCharging);
    }
  }
}
