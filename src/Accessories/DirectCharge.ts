import { Service, PlatformAccessory, PlatformConfig, Logger, API, Characteristic } from 'homebridge';
import { PorscheAccessory } from '../PlatformTypes';
import { VehicleEMobility, VehiclePosition, Vehicle } from 'porsche-connect';

export default class DirectCharge implements PorscheAccessory {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private switchService: Service;
  private vehicle: Vehicle | undefined;
  private heartBeatActive = false;

  constructor(public config: PlatformConfig, public readonly log: Logger, public readonly api: API, public accessory: PlatformAccessory) {
    this.accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, 'Porsche')
      .setCharacteristic(this.Characteristic.Model, this.accessory.context.device.modelDescription)
      .setCharacteristic(this.Characteristic.SerialNumber, `${this.accessory.context.device.vin}-direct-charge`);

    this.switchService = this.accessory.getService(this.Service.Switch) || this.accessory.addService(this.Service.Switch);
    this.switchService.getCharacteristic(this.Characteristic.On).on('set', this.setStatus.bind(this));
  }

  private async setStatus(value, callback) {
    if (this.vehicle && !this.heartBeatActive) {
      if (value) {
        this.log.debug('Connecting with API to initiate Direct charge');
        await this.vehicle.enableDirectCharge(false);
      } else {
        this.log.debug('Connecting with API to stop Direct charge');
        await this.vehicle.disableDirectCharge(false);
      }
      return callback();
    }

    callback();
  }

  public beat(emobilityInfo: VehicleEMobility, positionInfo: VehiclePosition, vehicle: Vehicle) {
    this.heartBeatActive = true;
    this.vehicle = vehicle;

    const isDirectChargeActive = !!emobilityInfo.directCharge.isActive;
    if (isDirectChargeActive !== this.switchService.getCharacteristic(this.Characteristic.On).value) {
      this.log.info('Direct charge ->', isDirectChargeActive ? 'ON' : 'OFF');
    }
    this.switchService.setCharacteristic(this.Characteristic.On, isDirectChargeActive);

    this.heartBeatActive = false;
  }
}
