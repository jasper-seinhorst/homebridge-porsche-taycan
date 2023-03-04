import { PorscheConnectBase } from './PorscheConnectBase';
import type { VehiclePosition, VehicleEMobility, VehicleOverview, TripInfo } from './VehicleTypes';

export class WrongPinError extends Error {}

export abstract class PorscheConnectVehicle extends PorscheConnectBase {
  public async getVehicleEmobilityInfo(vin: string, carModel: string): Promise<VehicleEMobility> {
    const res = await this.getFromApi(this.routes.vehicleEmobilityURL(vin, carModel));
    return res.data;
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
