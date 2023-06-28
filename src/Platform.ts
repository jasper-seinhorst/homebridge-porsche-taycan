import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { Battery, Charger, DirectClimatisation } from './Accessories';
import PorscheConnect, { EngineType } from 'porsche-connect';
import { PlatformVehicle, PorscheAccessory } from './PlatformTypes';

export class PorscheTaycanPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];
  public PorscheConnectAuth: PorscheConnect | undefined;
  private platformVehicles: PlatformVehicle[] = [];
  private heartBeatInterval: number;

  constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
    this.heartBeatInterval = (config.pollInterval || 15) * 60 * 1000;
    this.api.on('didFinishLaunching', () => {
      this.initialise();
    });
  }

  public configureAccessory(accessory: PlatformAccessory) {
    this.accessories.push(accessory);
  }

  private validateConfig(): boolean {
    return this.config.username && this.config.password;
  }

  private async initialise() {
    if (!this.validateConfig()) {
      this.log.warn('Please specify your Porsche Connect username and password in your config file');
      return;
    }

    try {
      this.log.info('Authentication');
      this.PorscheConnectAuth = new PorscheConnect({ username: this.config.username, password: this.config.password });
      this.log.info('Retrieving available vehicles');
      await this.discoverVehicles();
    } catch (error) {
      this.log.error('Porsche Connect connection failed');
      this.log.debug('Reason: ', error);
    }

    await this.heartBeat();
    setInterval(() => {
      this.heartBeat();
    }, this.heartBeatInterval);
  }

  private async discoverVehicles() {
    if (this.PorscheConnectAuth) {
      const vehicles = await this.PorscheConnectAuth.getVehicles();
      for (const vehicle of vehicles) {
        if (vehicle.engineType === EngineType.BatteryPowered) {
          const platformVehicle: PlatformVehicle = { vehicle, accessories: [] };

          // Register Charger
          const chargerUuid = this.api.hap.uuid.generate(`${vehicle.vin}-charger`);
          const chargerExistingAccessory = this.accessories.find(accessory => accessory.UUID === chargerUuid);

          if (chargerExistingAccessory) {
            platformVehicle.accessories.push(new Charger(this.config, this.log, this.api, chargerExistingAccessory));
          } else {
            this.log.info('Charger added as accessory');
            const accessory = new this.api.platformAccessory('Charger', chargerUuid);
            accessory.context.device = vehicle;
            platformVehicle.accessories.push(new Charger(this.config, this.log, this.api, accessory));
            this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
          }

          // Register DirectClimatisation
          const directClimatisationUuid = this.api.hap.uuid.generate(`${vehicle.vin}-direct-climatisation`);
          const directClimatisationExistingAccessory = this.accessories.find(accessory => accessory.UUID === directClimatisationUuid);

          if (directClimatisationExistingAccessory) {
            platformVehicle.accessories.push(new DirectClimatisation(this.config, this.log, this.api, directClimatisationExistingAccessory));
          } else {
            this.log.info('Direct Climatisation added as accessory');
            const accessory = new this.api.platformAccessory('Direct Climatisation', directClimatisationUuid);
            accessory.context.device = vehicle;
            platformVehicle.accessories.push(new DirectClimatisation(this.config, this.log, this.api, accessory));
            this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
          }

          // (Optionally) Register Battery
          if (this.config.batteryDevice === true) {
            const batteryUuid = this.api.hap.uuid.generate(`${vehicle.vin}-battery`);
            const batteryExistingAccessory = this.accessories.find(accessory => accessory.UUID === batteryUuid);

            if (batteryExistingAccessory) {
              platformVehicle.accessories.push(new Battery(this.config, this.log, this.api, batteryExistingAccessory));
            } else {
              this.log.info('Battery added as accessory');
              const accessory = new this.api.platformAccessory('Battery', batteryUuid);
              accessory.context.device = vehicle;
              platformVehicle.accessories.push(new Battery(this.config, this.log, this.api, accessory));
              this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
            }
          }

          // Register car for heart beat
          this.platformVehicles.push(platformVehicle);
        } else {
          this.log.info(`Your Porsche ${vehicle.modelDescription} is not supported, it has an unsupported engine type ${vehicle.engineType}`);
        }
      }
    }
  }

  private async heartBeat() {
    this.platformVehicles.forEach(async (platformVehicle: PlatformVehicle) => {
      this.log.info(`Updating vehicle data for ${platformVehicle.vehicle.modelDescription}`);
      const vehicle = platformVehicle.vehicle;
      const emobilityInfo = await vehicle.getEmobilityInfo();

      if (emobilityInfo.batteryChargeStatus === null) {
        this.log.error('Your PCM seems to be in private mode');
        this.log.debug('Reason: ', emobilityInfo);
        return;
      }

      platformVehicle.accessories.forEach((accessory: PorscheAccessory) => {
        accessory.beat(emobilityInfo, vehicle);
      });
    });
  }
}
