import type { PorscheConnect } from './PorscheConnect';
import { EngineType, SteeringWheelPosition } from './VehicleEnums';
import type {
  VehicleCapabilities,
  VehicleConfig,
  VehicleEMobility,
  VehicleOverview,
  TripInfo
} from './VehicleTypes';

export class NotSupportedError extends Error {}

export class Vehicle {
  private readonly porscheConnect: PorscheConnect;
  public readonly vin: string;
  public readonly modelDescription: string;
  public readonly modelType: string;
  public readonly modelYear: number;
  public readonly carModel: string;
  public readonly engineType: EngineType;
  public readonly steeringWheelPosition: SteeringWheelPosition;
  public readonly remoteCapabilities: VehicleCapabilities;
  public readonly permissions: {
    userIsActive: boolean;
    userRoleStatus: 'ENABLED' | string;
  };

  public constructor(porscheConnect, opts: VehicleConfig) {
    this.porscheConnect = porscheConnect;
    this.vin = opts.vin;
    this.modelDescription = opts.modelDescription;
    this.modelType = opts.modelType;
    this.modelYear = opts.modelYear;
    this.carModel = opts.carModel;
    this.engineType = opts.engineType;
    this.steeringWheelPosition = opts.steeringWheelPosition;
    this.remoteCapabilities = opts.remoteCapabilities;
    this.permissions = opts.permissions;
  }

  public async getEmobilityInfo(): Promise<VehicleEMobility> {
    if ([EngineType.BatteryPowered, EngineType.PluginHybrid].includes(this.engineType)) {
      return await this.porscheConnect.getVehicleEmobilityInfo(this.vin, this.carModel);
    } else {
      throw new NotSupportedError();
    }
  }
}
