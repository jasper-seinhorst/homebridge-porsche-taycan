import { PorscheConnectBase } from './PorscheConnectBase';
import type { VehiclePosition, VehicleEMobility, VehicleOverview, TripInfo } from './VehicleTypes';

export class WrongPinError extends Error {}

export abstract class PorscheConnectVehicle extends PorscheConnectBase {
  public async getVehiclePosition(vin: string): Promise<VehiclePosition> {
    const res = await this.getFromApi(this.routes.vehiclePositionURL(vin));
    return res.data;
  }

  public async getVehicleEmobilityInfo(vin: string, carModel: string): Promise<VehicleEMobility> {
    const res = await this.getFromApi(this.routes.vehicleEmobilityURL(vin, carModel));
    return res.data;
  }

  private async toggleVehicleDirectCharge(vin: string, carModel: string, on: boolean, waitForConfirmation = false) {
    const res = await this.postToApi(this.routes.vehicleToggleDirectChargingURL(vin, carModel, on));

    if (waitForConfirmation) {
      await this.getStatusFromApi(this.routes.vehicleToggleDirectChargingStatusURL(vin, carModel, res.data.requestId));
    }
  }

  public async enableVehicleDirectCharge(vin: string, carModel: string, waitForConfirmation = false) {
    await this.toggleVehicleDirectCharge(vin, carModel, true, waitForConfirmation);
  }

  public async disableVehicleDirectCharge(vin: string, carModel: string, waitForConfirmation = false) {
    await this.toggleVehicleDirectCharge(vin, carModel, false, waitForConfirmation);
  }

  private async toggleVehicleClimate(vin: string, on: boolean, waitForConfirmation = false) {
    const res = await this.postToApi(this.routes.vehicleToggleClimateURL(vin, on));

    if (waitForConfirmation) {
      await this.getStatusFromApi(this.routes.vehicleToggleClimateStatusURL(vin, res.data.requestId));
    }
  }

  public async enableVehicleClimate(vin: string, waitForConfirmation = false) {
    await this.toggleVehicleClimate(vin, true, waitForConfirmation);
  }

  public async disableVehicleClimate(vin: string, waitForConfirmation = false) {
    await this.toggleVehicleClimate(vin, false, waitForConfirmation);
  }

  private async honkAndOrFlashVehicle(vin: string, honkAlso: boolean, waitForConfirmation = false) {
    const res = await this.postToApi(this.routes.vehicleHonkAndOrFlashURL(vin, honkAlso));

    if (waitForConfirmation) {
      await this.getStatusFromApi(this.routes.vehicleHonkAndOrFlashStatusURL(vin, res.data.id));
    }
  }

  public async honkAndFlashVehicle(vin: string, waitForConfirmation = false) {
    await this.honkAndOrFlashVehicle(vin, waitForConfirmation);
  }

  public async flashVehicle(vin: string, waitForConfirmation = false) {
    await this.honkAndOrFlashVehicle(vin, false, waitForConfirmation);
  }

  private async toggleVehicleLocked(vin: string, lock: boolean, pin: string, waitForConfirmation = false) {
    const res = await this.postToApi(this.routes.vehicleToggleLockedURL(vin, lock), {
      pin
    });

    if (res.data.pcckErrorKey == 'INCORRECT') throw new WrongPinError(`PIN code was incorrect`);
    if (res.data.pcckErrorKey == 'LOCKED_60_MINUTES') throw new WrongPinError(`Too many failed attempts, locked 60 minutes`);

    if (waitForConfirmation) {
      await this.getStatusFromApi(this.routes.vehicleToggleLockedStatusURL(vin, res.data.requestId));
    }
  }

  public async lockVehicle(vin: string, pin: string, waitForConfirmation = false) {
    await this.toggleVehicleLocked(vin, true, pin, waitForConfirmation);
  }

  public async unlockVehicle(vin: string, pin: string, waitForConfirmation = false) {
    await this.toggleVehicleLocked(vin, false, pin, waitForConfirmation);
  }

  public async getVehicleStoredOverview(vin: string): Promise<VehicleOverview> {
    const res = await this.getFromApi(this.routes.vehicleStoredOverviewURL(vin));
    return res.data;
  }

  public async getVehicleCurrentOverview(vin: string): Promise<VehicleOverview> {
    const req = await this.postToApi(this.routes.vehicleCurrentOverviewInvokeURL(vin));
    await this.getStatusFromApi(this.routes.vehicleCurrentOverviewStatusURL(vin, req.data.requestId), 60);
    const res = await this.getFromApi(this.routes.vehicleCurrentOverviewDataURL(vin, req.data.requestId));
    return res.data;
  }

  public async getVehicleMaintenanceInfo(vin: string): Promise<any> {
    const res = await this.getFromApi(this.routes.vehicleMaintenanceInfoURL(vin));
    return res.data;
  }

  public async getVehicleTripInfo(vin: string, longTermOverview = false): Promise<TripInfo[]> {
    const res = await this.getFromApi(this.routes.vehicleTripsUrl(vin, longTermOverview));
    return res.data;
  }
}
