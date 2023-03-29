import { PorscheConnectBase } from './PorscheConnectBase';
import type { VehicleEMobility } from './VehicleTypes';

export class WrongPinError extends Error {}

export abstract class PorscheConnectVehicle extends PorscheConnectBase {
  public async getVehicleEmobilityInfo(vin: string, carModel: string): Promise<VehicleEMobility> {
    const res = await this.getFromApi(this.routes.vehicleEmobilityURL(vin, carModel));
    return res.data;
  }

  private async toggleVehicleDirectCharge(vin: string, carModel: string, on: boolean) {
    await this.postToApi(this.routes.vehicleToggleDirectChargingURL(vin, carModel, on));
  }

  public async enableVehicleDirectCharge(vin: string, carModel: string) {
    await this.toggleVehicleDirectCharge(vin, carModel, true);
  }

  public async disableVehicleDirectCharge(vin: string, carModel: string) {
    await this.toggleVehicleDirectCharge(vin, carModel, false);
  }

  private async toggleVehicleClimate(vin: string, on: boolean) {
    await this.postToApi(this.routes.vehicleToggleClimateURL(vin, on));
  }

  public async enableVehicleClimate(vin: string) {
    await this.toggleVehicleClimate(vin, true);
  }

  public async disableVehicleClimate(vin: string) {
    await this.toggleVehicleClimate(vin, false);
  }
}
