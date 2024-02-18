import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { Battery, Charger, PrecoolHeat, DirectCharge, ChargingPower, Occupancy } from './Accessories';
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
      this.PorscheConnectAuth = new PorscheConnect({ username: this.config.username, password: this.config.password});
    } catch (error) {
      this.log.error('Porsche Connect connection failed');
      this.log.debug('Reason: ', error);
    }

    this.log.info('Retrieving available vehicles');
    await this.discoverVehicles();
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
          this.log.info(`Initializing ${vehicle.nickname}`);
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

          // Register Precool / heat
          const precoolHeatUuid = this.api.hap.uuid.generate(`${vehicle.vin}-precool-heat`);
          const precoolHeatExistingAccessory = this.accessories.find(accessory => accessory.UUID === precoolHeatUuid);

          if (precoolHeatExistingAccessory) {
            platformVehicle.accessories.push(new PrecoolHeat(this.config, this.log, this.api, precoolHeatExistingAccessory));
          } else {
            this.log.info('Precool/heat added as accessory');
            const accessory = new this.api.platformAccessory('Precool/heat', precoolHeatUuid);
            accessory.context.device = vehicle;
            platformVehicle.accessories.push(new PrecoolHeat(this.config, this.log, this.api, accessory));
            this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
          }

          // Register Direct charge
          const directChargeUuid = this.api.hap.uuid.generate(`${vehicle.vin}-direct-charge`);
          const directChargeExistingAccessory = this.accessories.find(accessory => accessory.UUID === directChargeUuid);

          if (directChargeExistingAccessory) {
            platformVehicle.accessories.push(new DirectCharge(this.config, this.log, this.api, directChargeExistingAccessory));
          } else {
            this.log.info('Direct charge added as accessory');
            const accessory = new this.api.platformAccessory('Direct charge', directChargeUuid);
            accessory.context.device = vehicle;
            platformVehicle.accessories.push(new DirectCharge(this.config, this.log, this.api, accessory));
            this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
          }

          // (Optionally) Register Battery
          const batteryChargeUuid = this.api.hap.uuid.generate(`${vehicle.vin}-battery`);
          const batteryExistingAccessory = this.accessories.find(accessory => accessory.UUID === batteryChargeUuid);
          if (this.config.batteryDevice === true) {

            if (batteryExistingAccessory) {
              platformVehicle.accessories.push(new Battery(this.config, this.log, this.api, batteryExistingAccessory));
            } else {
              this.log.info('Battery added as accessory');
              const accessory = new this.api.platformAccessory('Battery', batteryChargeUuid);
              accessory.context.device = vehicle;
              platformVehicle.accessories.push(new Battery(this.config, this.log, this.api, accessory));
              this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
            }
          } else {
            if (batteryExistingAccessory) {
              this.api.unregisterPlatformAccessories(batteryChargeUuid, 'homebridge-porsche-taycan', [batteryExistingAccessory]);
            }
          }

          // (Optionally) Charging Power
          const chargingPowerUuid = this.api.hap.uuid.generate(`${vehicle.vin}-charging-power`);
          const chargingPowerExistingAccessory = this.accessories.find(accessory => accessory.UUID === chargingPowerUuid);
          if (this.config.chargingPowerDevice === true) {
            if (chargingPowerExistingAccessory) {
              platformVehicle.accessories.push(new ChargingPower(this.config, this.log, this.api, chargingPowerExistingAccessory));
            } else {
              this.log.info('Charging Power added as accessory');
              const accessory = new this.api.platformAccessory('Charging Power', chargingPowerUuid);
              accessory.context.device = vehicle;
              platformVehicle.accessories.push(new ChargingPower(this.config, this.log, this.api, accessory));
              this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
            }
          } else {
            if (chargingPowerExistingAccessory) {
              this.api.unregisterPlatformAccessories(chargingPowerUuid, 'homebridge-porsche-taycan', [chargingPowerExistingAccessory]);
            }
          }

          // (Optionally) Occupancy
          const occupancyUuid = this.api.hap.uuid.generate(`${vehicle.vin}-occupancy`);
          const occupancyExistingAccessory = this.accessories.find(accessory => accessory.UUID === occupancyUuid);
          if (this.config.locationConfig && this.config.locationConfig.lat && this.config.locationConfig.long) {
            if (occupancyExistingAccessory) {
              platformVehicle.accessories.push(new Occupancy(this.config, this.log, this.api, occupancyExistingAccessory));
            } else {
              this.log.info('Occupancy added as accessory');
              const accessory = new this.api.platformAccessory('Occupancy', occupancyUuid);
              accessory.context.device = vehicle;
              platformVehicle.accessories.push(new Occupancy(this.config, this.log, this.api, accessory));
              this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
            }
          } else {
            if (occupancyExistingAccessory) {
              this.api.unregisterPlatformAccessories(occupancyUuid, 'homebridge-porsche-taycan', [occupancyExistingAccessory]);
            }
          }

          // Register car for heart beat
          this.platformVehicles.push(platformVehicle);
        } else {
          this.log.info(`Your Porsche ${vehicle.nickname} is not supported, it has an unsupported engine type ${vehicle.engineType}`);
        }
      }
    }
  }

  private async heartBeat() {
    this.platformVehicles.forEach(async (platformVehicle: PlatformVehicle) => {
      this.log.debug(`Updating vehicle data for ${platformVehicle.vehicle.nickname}`);
      const vehicle = platformVehicle.vehicle;
      const emobilityInfo = await vehicle.getEmobilityInfo();
      const positionInfo = await vehicle.getPosition();

      if (emobilityInfo.batteryChargeStatus === null) {
        this.log.error('Your PCM seems to be in private mode');
        this.log.debug('Reason: ', emobilityInfo);
        return;
      }

      platformVehicle.accessories.forEach((accessory: PorscheAccessory) => {
        accessory.beat(emobilityInfo, positionInfo, vehicle);
      });
    });
  }
}
