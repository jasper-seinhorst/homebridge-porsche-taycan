import type { PorscheConnect } from './PorscheConnect';
import { EngineType, SteeringWheelPosition } from './VehicleEnums';
import type {
  VehiclePicture,
  VehicleCapabilities,
  VehicleConfig,
  VehiclePosition,
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
  public readonly exteriorColor: string;
  public readonly exteriorColorHex: string;
  public readonly steeringWheelPosition: SteeringWheelPosition;
  public readonly pictures: VehiclePicture[];
  public readonly nickname: string | null;
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
    this.exteriorColor = opts.exteriorColor;
    this.exteriorColorHex = opts.exteriorColorHex;
    this.steeringWheelPosition = opts.steeringWheelPosition;
    // @ts-ignore
    this.pictures = opts.pictures;
    this.nickname = opts.nickName;
    this.remoteCapabilities = opts.remoteCapabilities;
    this.permissions = opts.permissions;
  }

  public async getPosition(): Promise<VehiclePosition> {
    return await this.porscheConnect.getVehiclePosition(this.vin);
  }

  public async getEmobilityInfo(): Promise<VehicleEMobility> {
    if ([EngineType.BatteryPowered, EngineType.PluginHybrid].includes(this.engineType)) {
      return await this.porscheConnect.getVehicleEmobilityInfo(this.vin, this.carModel);
    } else {
      throw new NotSupportedError();
    }
  }

  public async enableDirectCharge(waitForConfirmation = false) {
    await this.porscheConnect.enableVehicleDirectCharge(this.vin, this.carModel, waitForConfirmation);
  }

  public async disableDirectCharge(waitForConfirmation = false) {
    await this.porscheConnect.disableVehicleDirectCharge(this.vin, this.carModel, waitForConfirmation);
  }

  public async enableClimate(waitForConfirmation = false) {
    await this.porscheConnect.enableVehicleClimate(this.vin, waitForConfirmation);
  }

  public async disableClimate(waitForConfirmation = false) {
    await this.porscheConnect.disableVehicleClimate(this.vin, waitForConfirmation);
  }

  public async honkAndFlash(waitForConfirmation = false) {
    if (this.remoteCapabilities.hasHonkAndFlash) {
      await this.porscheConnect.honkAndFlashVehicle(this.vin, waitForConfirmation);
    } else {
      throw new NotSupportedError();
    }
  }

  public async flash(waitForConfirmation = false) {
    if (this.remoteCapabilities.hasHonkAndFlash) {
      await this.porscheConnect.flashVehicle(this.vin, waitForConfirmation);
    } else {
      throw new NotSupportedError();
    }
  }

  public async lock(pin: string, waitForConfirmation = false) {
    await await this.porscheConnect.lockVehicle(this.vin, pin, waitForConfirmation);
  }

  public async unlock(pin: string, waitForConfirmation = false) {
    await await this.porscheConnect.unlockVehicle(this.vin, pin, waitForConfirmation);
  }

  public async getStoredOverview(): Promise<VehicleOverview> {
    return await this.porscheConnect.getVehicleStoredOverview(this.vin);
  }

  public async getCurrentOverview(): Promise<VehicleOverview> {
    return await this.porscheConnect.getVehicleCurrentOverview(this.vin);
  }

  public async getMaintenanceInfo(): Promise<any> {
    return await this.porscheConnect.getVehicleMaintenanceInfo(this.vin);
  }

  public async getTripInfo(longTermOverview = false): Promise<TripInfo[]> {
    return await this.porscheConnect.getVehicleTripInfo(this.vin, longTermOverview);
  }
}
