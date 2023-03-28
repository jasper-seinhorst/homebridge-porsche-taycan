import { PorscheConnectBase } from './PorscheConnectBase';
import type { VehicleEMobility } from './VehicleTypes';

export class WrongPinError extends Error {}

export abstract class PorscheConnectVehicle extends PorscheConnectBase {
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
}
