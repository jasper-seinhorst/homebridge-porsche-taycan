import { Service, PlatformAccessory } from 'homebridge';
import { Vehicle } from 'porsche-connect';

import { PorscheTaycanPlatform } from './platform';

export class PorscheChargerAccessory {
  private chargerService: Service;
  private batteryService: Service;
  private vehicle: Vehicle;

  constructor(
    private readonly platform: PorscheTaycanPlatform,
    private readonly accessory: PlatformAccessory,

  ) {
    this.vehicle = new Vehicle(this.platform.PorscheConnectAuth, this.accessory.context.device);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Porsche')
      .setCharacteristic(this.platform.Characteristic.Model, this.accessory.context.device.modelType)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.context.device.vin);

    // Charger
    this.chargerService = this.accessory.getService(this.platform.Service.OccupancySensor)
      || this.accessory.addService(this.platform.Service.OccupancySensor);

    // Battery
    this.batteryService = this.accessory.getService(this.platform.Service.Battery)
      || this.accessory.addService(this.platform.Service.Battery);
    this.getBatteryState();

    // Update state every couple of minutes
    const interval = this.platform.config.pollInterval || 10;
    this.platform.log.debug('Interval battery ->', this.platform.config.pollInterval);
    setInterval(() => {
      this.getBatteryState();
    }, (interval * 60 * 1000));
  }

  async getBatteryState() {
    this.platform.log.debug('Retrieving Battery Characteristic form Porsche Connect API');
    const emobilityInfo = await this.vehicle.getEmobilityInfo();

    const battery = emobilityInfo.batteryChargeStatus.stateOfChargeInPercentage;
    this.platform.log.debug('Set Characteristic Battery ->', battery);
    this.batteryService.setCharacteristic(this.platform.Characteristic.BatteryLevel, battery);

    const isCharging = emobilityInfo.batteryChargeStatus.chargingState === 'CHARGING';
    this.platform.log.debug('Set Characteristic Charging ->', isCharging);
    this.chargerService.setCharacteristic(this.platform.Characteristic.OccupancyDetected, isCharging);

    const isLowBattery = (battery <= 30);
    this.platform.log.debug('Set Characteristic Low Battery ->', isLowBattery);
    this.batteryService.setCharacteristic(this.platform.Characteristic.StatusLowBattery, isLowBattery);
  }

}
