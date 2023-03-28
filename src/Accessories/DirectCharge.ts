import { Service, PlatformAccessory, PlatformConfig, Logger, API, Characteristic } from 'homebridge';
import { PorscheAccessory } from '../PlatformTypes';
import { VehicleEMobility, Vehicle } from '../porsche-connect';

export default class DirectCharge implements PorscheAccessory {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private switchService: Service;
  private vehicle: Vehicle | undefined;
  private heartBeatActive = false;

  constructor(public config: PlatformConfig, public readonly log: Logger, public readonly api: API, public accessory: PlatformAccessory) {
    this.switchService = this.accessory.getService(this.Service.Switch) || this.accessory.addService(this.Service.Switch);
    this.switchService.getCharacteristic(this.Characteristic.On).on('set', this.setStatus.bind(this));
    this.switchService.setCharacteristic(this.Characteristic.On, false);
  }

  private async setStatus(value, callback) {
    // Only call API when status is not changed during heartbeat
    if (this.vehicle && !this.heartBeatActive) {
      if (value) {
        this.log.debug('Connecting with API to enableDirectCharge');
        this.vehicle.enableDirectCharge(false);
      } else {
        this.log.debug('Connecting with API to disableDirectCharge');
        this.vehicle.disableDirectCharge(false);
      }
      return callback();
    }

    callback();
  }

  public beat(emobilityInfo: VehicleEMobility, vehicle: Vehicle) {
    this.heartBeatActive = true;
    this.vehicle = vehicle;

    const isDirectChargeActive = !!emobilityInfo.directCharge.isActive;
    if (isDirectChargeActive !== this.switchService.getCharacteristic(this.Characteristic.On).value) {
      this.log.debug('Direct Charge ->', isDirectChargeActive ? 'ON' : 'OFF');
    }
    this.switchService.setCharacteristic(this.Characteristic.On, isDirectChargeActive);

    this.heartBeatActive = false;
  }
}
