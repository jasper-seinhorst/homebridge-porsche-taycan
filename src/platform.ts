import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { PorscheChargerAccessory } from './chargerAccessory';
import { PorscheSecurityAccessory } from './securityAccessory';
import PorscheConnect, { EngineType, SecurityTypes, VehicleSecurityAccessoires } from './porsche-connect';

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
  private porscheSecurityAccessories: VehicleSecurityAccessoires[] = [];

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  async discoverDevices() {
    const vehicles = await this.PorscheConnectAuth.getVehicles();
    for (const vehicle of vehicles) {

      // charger accessory
      if ([EngineType.BatteryPowered, EngineType.PluginHybrid].includes(vehicle.engineType)) {
        const uuidCharger = this.api.hap.uuid.generate(`${vehicle.vin}-charger`);
        const existingAccessoryCharger = this.accessories.find(accessory => accessory.UUID === uuidCharger);
        if (existingAccessoryCharger) {
          this.log.info('Restoring existing accessory from cache:', existingAccessoryCharger.displayName);
          new PorscheChargerAccessory(this, existingAccessoryCharger);
        } else {
          this.log.info('Adding new accessory:', vehicle.modelDescription);
          const accessory = new this.api.platformAccessory(`${vehicle.modelDescription} charger`, uuidCharger);
          accessory.context.device = vehicle;
          new PorscheChargerAccessory(this, accessory);
          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
      } else {
        this.log.info('Vehicle not supported', vehicle.engineType);
      }

      // security accessory
      const securityAccessores: SecurityTypes[] = [
        { type: 'doors', location: 'frontLeft', name: 'Front left door' },
        { type: 'doors', location: 'frontRight', name: 'Front right door' },
        { type: 'doors', location: 'backLeft', name: 'Rear left door' },
        { type: 'doors', location: 'backRight', name: 'Rear right door' },
        { type: 'windows', location: 'frontLeft', name: 'Front left window' },
        { type: 'windows', location: 'frontRight', name: 'Front right window' },
        { type: 'windows', location: 'backLeft', name: 'Rear left window' },
        { type: 'windows', location: 'backRight', name: 'Rear right window' },
      ];

      this.porscheSecurityAccessories.push({
        vin: vehicle.vin,
        accessories: [],
      });

      const currentSecurityAccessoires = this.porscheSecurityAccessories.find(a => a.vin === vehicle.vin)!.accessories;

      for (const securityAccessory of securityAccessores) {
        const uuidSecurity = this.api.hap.uuid.generate(`${vehicle.vin}-security-${securityAccessory.location}`);
        const existingAccessorySecurity = this.accessories.find(accessory => accessory.UUID === uuidSecurity);
        const name = `${vehicle.modelDescription} ${securityAccessory.name}`;

        if (existingAccessorySecurity) {
          this.log.info('Restoring existing accessory from cache:', existingAccessorySecurity.displayName);
          currentSecurityAccessoires.push(new PorscheSecurityAccessory(this, existingAccessorySecurity, securityAccessory));
        } else {
          this.log.info('Adding new accessory:', name);
          const accessory = new this.api.platformAccessory(name, uuidSecurity);
          accessory.context.device = vehicle;
          currentSecurityAccessoires.push(new PorscheSecurityAccessory(this, accessory, securityAccessory));
          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
      }

      this.heartBeat(vehicle, currentSecurityAccessoires);
      const interval = this.config.pollInterval || 10;
      setInterval(() => {
        this.heartBeat(vehicle, currentSecurityAccessoires);
      }, interval * 60 * 1000);
    }
  }

  async heartBeat(vehicle, accessoires: PorscheSecurityAccessory[]) {
    this.log.info('Heartbeat', vehicle.vin);
    const overviewData = await vehicle.getCurrentOverview();

    accessoires.forEach(accessory => {
      accessory.update(overviewData);
    });
  }
}
