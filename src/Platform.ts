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
        const uuid = this.api.hap.uuid.generate(`${vehicle.vin}-charger`);
        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
        const accessoryName = `${vehicle.modelDescription} Charger`;

        if (existingAccessory) {
          this.log.info(`Porsche ${vehicle.modelDescription} is ready`);
          platformVehicle.accessories.push(new PorscheChargerAccessory(this.config, this.log, this.api, existingAccessory));
        } else {
          this.log.info(`Porsche ${vehicle.modelDescription} is added as accessory`);
          const accessory = new this.api.platformAccessory(accessoryName, uuid);
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

  private async heartBeat() {
    this.platformVehicles.forEach(async (platformVehicle: PlatformVehicle) => {
      this.log.info(`Updating vehicle data for ${platformVehicle.vehicle.modelDescription}`);
      const vehicle = new Vehicle(this.PorscheConnectAuth, platformVehicle.vehicle);
      const emobilityInfo = await vehicle.getEmobilityInfo();
      platformVehicle.accessories.forEach((accessory: PorscheAccessory) => {
        accessory.update(emobilityInfo);
      });
    });
  }
}
