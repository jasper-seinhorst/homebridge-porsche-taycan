import { Service, PlatformAccessory, PlatformConfig, Logger, API, Characteristic } from 'homebridge';
import { PorscheAccessory } from '../PlatformTypes';
import { VehicleEMobility } from 'porsche-connect';

export default class Battery implements PorscheAccessory {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private batteryDevice: Service;

  constructor(public config: PlatformConfig, public readonly log: Logger, public readonly api: API, public accessory: PlatformAccessory) {
    this.accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, 'Porsche')
      .setCharacteristic(this.Characteristic.Model, this.accessory.context.device.modelDescription)
      .setCharacteristic(this.Characteristic.SerialNumber, `${this.accessory.context.device.vin}-battery`);

    this.batteryDevice = this.accessory.getService(this.Service.HumiditySensor) || this.accessory.addService(this.Service.HumiditySensor);
  }

  public beat(emobilityInfo: VehicleEMobility) {
    // Battery level
    const newBatteryLevel = emobilityInfo.batteryChargeStatus.stateOfChargeInPercentage;
    this.batteryDevice.setCharacteristic(this.Characteristic.CurrentRelativeHumidity, newBatteryLevel);
  }
}
