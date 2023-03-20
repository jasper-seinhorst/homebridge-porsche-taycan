import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { PorscheChargerAccessory } from './ChargerAccessory';
import PorscheConnect, { EngineType, Vehicle } from './porsche-connect';
import { PlatformVehicle, PorscheAccessory } from './PlatformTypes';

export class PorscheTaycanPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];
  public readonly PorscheConnectAuth = new PorscheConnect({ username: this.config.username, password: this.config.password });
  private platformVehicles: PlatformVehicle[] = [];
  private pollInterval: number;

  constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
    this.pollInterval = config.pollInterval || 15;
    this.api.on('didFinishLaunching', () => {
      this.initialise();
    });
  }

  public configureAccessory(accessory: PlatformAccessory) {
    this.accessories.push(accessory);
  }

  private async initialise() {
    await this.discoverVehicles();

    this.hearthBeat();
    setInterval(() => {
      this.hearthBeat();
    }, (this.pollInterval * 60 * 1000));
  }

  private async discoverVehicles() {
    const vehicles = await this.PorscheConnectAuth.getVehicles();
    for (const vehicle of vehicles) {
      if (vehicle.engineType === EngineType.BatteryPowered) {
        const platformVehicle: PlatformVehicle = { vehicle, accessories: [] };
        const uuidCharger = this.api.hap.uuid.generate(`${vehicle.vin}-charger`);
        const existingAccessoryCharger = this.accessories.find(accessory => accessory.UUID === uuidCharger);
        const accessoryName = `${vehicle.modelDescription} Charger`;

        if (existingAccessoryCharger) {
          platformVehicle.accessories.push(new PorscheChargerAccessory(this.config, this.log, this.api, existingAccessoryCharger));
        } else {
          this.log.info(`Your Porsche ${vehicle.modelDescription} is added as accessory`);
          const accessory = new this.api.platformAccessory(accessoryName, uuidCharger);
          accessory.context.device = vehicle;
          platformVehicle.accessories.push(new PorscheChargerAccessory(this.config, this.log, this.api, accessory));
          this.api.registerPlatformAccessories('homebridge-porsche-taycan', 'PorscheTaycan', [accessory]);
        }
        this.platformVehicles.push(platformVehicle);
      } else {
        this.log.info(`Your Porsche ${vehicle.modelDescription} is not supported, it has an unsupported engine type ${vehicle.engineType}`);
      }
    }
  }

  private async hearthBeat() {
    this.platformVehicles.forEach(async platformVehicle => {
      const vehicle = new Vehicle(this.PorscheConnectAuth, platformVehicle.vehicle);
      const emobilityInfo = await vehicle.getEmobilityInfo();
      platformVehicle.accessories.forEach(accessory => {
        accessory.update(emobilityInfo);
      });
    });
  }
}
