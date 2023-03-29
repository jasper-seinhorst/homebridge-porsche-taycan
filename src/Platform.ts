import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { Charger, DirectCharge, DirectClimatisation } from './Accessories';
import PorscheConnect, { EngineType, Vehicle } from './porsche-connect';
import { PlatformVehicle, PorscheAccessory } from './PlatformTypes';

export class PorscheTaycanPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];
  public readonly PorscheConnectAuth = new PorscheConnect({ username: this.config.username, password: this.config.password });
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

  private async initialise() {
    await this.discoverVehicles();

    this.heartBeat();
    setInterval(() => {
      this.heartBeat();
    }, this.heartBeatInterval);
  }

  private async discoverVehicles() {
    const vehicles = await this.PorscheConnectAuth.getVehicles();
    for (const vehicle of vehicles) {
      if (vehicle.engineType === EngineType.BatteryPowered) {
        const platformVehicle: PlatformVehicle = { vehicle, accessories: [] };

        // Register Charger
        const chargerUuid = this.api.hap.uuid.generate(`${vehicle.vin}-charger`);
        const chargerExistingAccessory = this.accessories.find(accessory => accessory.UUID === chargerUuid);
        const chargerAccessoryName = `${vehicle.modelDescription} Charger`;

        if (chargerExistingAccessory) {
          platformVehicle.accessories.push(new Charger(this.config, this.log, this.api, chargerExistingAccessory));
        } else {
          this.log.info('Charger added as accessory');
          const accessory = new this.api.platformAccessory(chargerAccessoryName, chargerUuid);
          accessory.context.device = vehicle;
          platformVehicle.accessories.push(new Charger(this.config, this.log, this.api, accessory));
          this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
        }

        // Register DirectCharge
        const directChargeUuid = this.api.hap.uuid.generate(`${vehicle.vin}-direct-charge`);
        const directChargeExistingAccessory = this.accessories.find(accessory => accessory.UUID === directChargeUuid);
        const directChargeAccessoryName = `${vehicle.modelDescription} Direct Charge`;

        if (directChargeExistingAccessory) {
          platformVehicle.accessories.push(new DirectCharge(this.config, this.log, this.api, directChargeExistingAccessory));
        } else {
          this.log.info('Direct Charge added as accessory');
          const accessory = new this.api.platformAccessory(directChargeAccessoryName, directChargeUuid);
          accessory.context.device = vehicle;
          platformVehicle.accessories.push(new DirectCharge(this.config, this.log, this.api, accessory));
          this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
        }

        // Register DirectClimatisation
        const directClimatisationUuid = this.api.hap.uuid.generate(`${vehicle.vin}-direct-climatisation`);
        const directClimatisationExistingAccessory = this.accessories.find(accessory => accessory.UUID === directClimatisationUuid);
        const directClimatisationAccessoryName = `${vehicle.modelDescription} Direct Climatisation`;

        if (directClimatisationExistingAccessory) {
          platformVehicle.accessories.push(new DirectClimatisation(this.config, this.log, this.api, directClimatisationExistingAccessory));
        } else {
          this.log.info('Direct Climatisation added as accessory');
          const accessory = new this.api.platformAccessory(directClimatisationAccessoryName, directClimatisationUuid);
          accessory.context.device = vehicle;
          platformVehicle.accessories.push(new DirectClimatisation(this.config, this.log, this.api, accessory));
          this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
        }

        // Register car for heart beat
        this.platformVehicles.push(platformVehicle);
      } else {
        this.log.info(`Your Porsche ${vehicle.modelDescription} is not supported, it has an unsupported engine type ${vehicle.engineType}`);
      }
    }
  }

  private async heartBeat() {
    this.platformVehicles.forEach(async (platformVehicle: PlatformVehicle) => {
      this.log.info(`Updating vehicle data for ${platformVehicle.vehicle.modelDescription}`);
      const vehicle = new Vehicle(this.PorscheConnectAuth, platformVehicle.vehicle);
      const emobilityInfo = await vehicle.getEmobilityInfo();

      platformVehicle.accessories.forEach((accessory: PorscheAccessory) => {
        accessory.beat(emobilityInfo, vehicle);
      });
    });
  }
}
