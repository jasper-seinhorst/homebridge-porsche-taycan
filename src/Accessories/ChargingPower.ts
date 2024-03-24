import { Service, PlatformAccessory, PlatformConfig, Logger, API, Characteristic } from 'homebridge';
import { PorscheAccessory } from '../PlatformTypes';
import { VehicleEMobility } from 'porsche-connect';

export default class ChargingPower implements PorscheAccessory {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private chargingPower: Service;

  constructor(public config: PlatformConfig, public readonly log: Logger, public readonly api: API, public accessory: PlatformAccessory) {
    this.accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, 'Porsche')
      .setCharacteristic(this.Characteristic.Model, this.accessory.context.device.modelDescription)
      .setCharacteristic(this.Characteristic.SerialNumber, `${this.accessory.context.device.vin}-charging-power`);

    this.chargingPower = this.accessory.getService(this.Service.LightSensor) || this.accessory.addService(this.Service.LightSensor);
  }

  public beat(emobilityInfo: VehicleEMobility) {
    // Charging Power level
    const minimumLuxLevel = 0.0001;
    let newChargingPowerLevel = minimumLuxLevel;
    const isCharging = emobilityInfo.batteryChargeStatus.chargingState === 'CHARGING';
    if (isCharging) {
      newChargingPowerLevel = emobilityInfo.batteryChargeStatus.chargingPower;
    }

    if (newChargingPowerLevel !== this.chargingPower.getCharacteristic(this.Characteristic.CurrentAmbientLightLevel).value) {
      this.log.info('Charging Power ->', newChargingPowerLevel === minimumLuxLevel ? '0' : newChargingPowerLevel);
    }
    this.chargingPower.setCharacteristic(this.Characteristic.CurrentAmbientLightLevel, newChargingPowerLevel);
  }
}
