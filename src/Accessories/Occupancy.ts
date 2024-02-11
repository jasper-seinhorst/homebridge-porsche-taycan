import { Service, PlatformAccessory, PlatformConfig, Logger, API, Characteristic } from 'homebridge';
import { PorscheAccessory } from '../PlatformTypes';
import { VehicleEMobility, VehiclePosition } from 'porsche-connect';

export default class Charger implements PorscheAccessory {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  private occupancyService: Service;

  constructor(public config: PlatformConfig, public readonly log: Logger, public readonly api: API, public accessory: PlatformAccessory) {
    this.accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, 'Porsche')
      .setCharacteristic(this.Characteristic.Model, this.accessory.context.device.modelDescription)
      .setCharacteristic(this.Characteristic.SerialNumber, this.accessory.context.device.vin);

    this.occupancyService = this.accessory.getService(this.Service.OccupancySensor) || this.accessory.addService(this.Service.OccupancySensor);
  }

  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2:number) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    const dLon = this.deg2rad(lon2-lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  public beat(emobilityInfo: VehicleEMobility, positionInfo : VehiclePosition) {
    // Charging state
    const distance = this.getDistanceFromLatLonInKm(
      positionInfo.carCoordinate.latitude, positionInfo.carCoordinate.longitude, // Vehicle
      this.config.locationConfig.lat, this.config.locationConfig.long); // Home
    const isHome = distance < 0.3;
    if (isHome !== (this.occupancyService.getCharacteristic(this.Characteristic.OccupancyDetected).value === 1)) {
      this.log.info('Occupancy ->', isHome);
    }
    this.occupancyService.setCharacteristic(this.Characteristic.OccupancyDetected, isHome);
  }
}
