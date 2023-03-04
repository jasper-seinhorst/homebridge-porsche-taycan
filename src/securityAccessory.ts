import { Service, PlatformAccessory } from 'homebridge';
import { Vehicle, SecurityTypes, VehicleOverview } from './porsche-connect';

import { PorscheTaycanPlatform } from './platform';

export class PorscheSecurityAccessory {
  private vehicle: Vehicle;
  private service: Service;

  constructor(
    private readonly platform: PorscheTaycanPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly securityAccessory: SecurityTypes,
  ) {
    this.vehicle = new Vehicle(this.platform.PorscheConnectAuth, this.accessory.context.device);

    this.service =
      this.accessory.getService(securityAccessory.name) ||
      this.accessory.addService(this.platform.Service.ContactSensor, securityAccessory.name,
        `${this.vehicle.vin}-${securityAccessory.name}`,
      );
  }

  update(overviewData: VehicleOverview) {
    if (overviewData.doors && overviewData.windows) {
      const state = overviewData[this.securityAccessory.type][this.securityAccessory.location];

      this.platform.log.debug(`Set Characteristic ${this.securityAccessory.name} ->`, state);
      this.service
        .setCharacteristic(
          this.platform.Characteristic.ContactSensorState,
          this.getState(state),
        );
    }
  }

  getState(state) {
    if (state === 'CLOSED_LOCKED' || state === 'CLOSED_UNLOCKED' || state === 'CLOSED') {
      return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
    }

    return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
  }
}
