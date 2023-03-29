import { Service, PlatformAccessory, PlatformConfig, Logger, API, Characteristic } from 'homebridge';
import { PorscheAccessory } from '../PlatformTypes';
import { VehicleEMobility } from '../porsche-connect';

export default class Charger implements PorscheAccessory {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private chargerService: Service;
  private batteryService: Service;
  private lowBatteryLevel: number;
  private sensorType: 'occupancy' | 'contact';

  constructor(public config: PlatformConfig, public readonly log: Logger, public readonly api: API, public accessory: PlatformAccessory) {
    this.lowBatteryLevel = this.config.lowBattery || 35;
    this.sensorType = this.config.chargerDevice || 'occupancy';
    this.chargerService = this.accessory.getService(this.sensorType === 'occupancy' ? this.Service.OccupancySensor : this.Service.ContactSensor)
      || this.accessory.addService(this.sensorType === 'occupancy' ? this.Service.OccupancySensor : this.Service.ContactSensor);
    this.batteryService = this.accessory.getService(this.Service.Battery) || this.accessory.addService(this.Service.Battery);
  }

  public beat(emobilityInfo: VehicleEMobility) {
    // Battery level
    const newBatteryLevel = emobilityInfo.batteryChargeStatus.stateOfChargeInPercentage;
    if (newBatteryLevel !== this.batteryService.getCharacteristic(this.Characteristic.BatteryLevel).value) {
      this.log.debug('Battery level ->', newBatteryLevel);
    }
    this.batteryService.setCharacteristic(this.Characteristic.BatteryLevel, newBatteryLevel);

    // Is battery low state
    const isLowBatteryLevel = (newBatteryLevel <= this.lowBatteryLevel);
    if (isLowBatteryLevel !== (this.batteryService.getCharacteristic(this.Characteristic.StatusLowBattery).value === 1)) {
      this.log.debug('Low battery level state ->', isLowBatteryLevel);
    }
    this.batteryService.setCharacteristic(this.Characteristic.StatusLowBattery, isLowBatteryLevel);

    // Charging state
    const isCharging = emobilityInfo.batteryChargeStatus.chargingState === 'CHARGING';
    if (isCharging !== (this.batteryService.getCharacteristic(this.Characteristic.ChargingState).value === 1)) {
      this.log.debug('Charging state ->', isCharging);
    }
    this.chargerService.setCharacteristic(this.sensorType === 'occupancy' ? this.Characteristic.OccupancyDetected : this.Characteristic.ContactSensorState, isCharging);
    this.batteryService.setCharacteristic(this.Characteristic.ChargingState, isCharging);
  }
}
