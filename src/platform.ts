import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { PorscheChargerAccessory } from './chargerAccessory';
import PorscheConnect, { EngineType } from './porsche-connect';

export class PorscheTaycanPlatform implements DynamicPlatformPlugin {
  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];
  public readonly PorscheConnectAuth = new PorscheConnect({ username: this.config.username, password: this.config.password });

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  async discoverDevices() {
    const vehicles = await this.PorscheConnectAuth.getVehicles();
    for (const vehicle of vehicles) {
      // Charger accessory
      if (vehicle.engineType === EngineType.BatteryPowered) {
        const uuidCharger = this.api.hap.uuid.generate(`${vehicle.vin}-charger`);
        const existingAccessoryCharger = this.accessories.find(accessory => accessory.UUID === uuidCharger);
        const accessoryName = `${vehicle.modelDescription} Charger`;

        if (existingAccessoryCharger) {
          this.log.info('Restoring accessory from cache:', accessoryName);
          new PorscheChargerAccessory(this, existingAccessoryCharger);
        } else {
          this.log.info('Adding new accessory:', accessoryName);
          const accessory = new this.api.platformAccessory(accessoryName, uuidCharger);
          accessory.context.device = vehicle;
          new PorscheChargerAccessory(this, accessory);
          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
      } else {
        this.log.info('Vehicle not supported, unsupported engine type', vehicle.engineType);
      }
    }
  }
}
