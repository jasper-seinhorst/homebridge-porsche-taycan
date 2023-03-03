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
      if ([EngineType.BatteryPowered, EngineType.PluginHybrid].includes(vehicle.engineType)) {
        const uuid = this.api.hap.uuid.generate(vehicle.vin);
        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
        if (existingAccessory) {
          this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
          new PorscheChargerAccessory(this, existingAccessory);
        } else {
          this.log.info('Adding new accessory:', vehicle.modelDescription);
          const accessory = new this.api.platformAccessory(`${vehicle.modelDescription} charger`, uuid);
          accessory.context.device = vehicle;
          new PorscheChargerAccessory(this, accessory);
          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
      } else {
        this.log.info('Vehicle not supported', vehicle.engineType);
      }
    }
  }
}
