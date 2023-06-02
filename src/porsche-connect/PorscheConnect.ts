import axios, { AxiosResponse } from 'axios';
import { PorscheConnectBase } from './PorscheConnectBase';
import { PorscheConnectAuth } from './PorscheConnect+Auth';
import { Vehicle } from './Vehicle';
import { Application } from './Application';
import type { VehicleConfig } from './VehicleTypes';
import { PorscheConnectVehicle } from './PorscheConnect+Vehicle';

export class PorscheError extends Error { }
export class PorschePrivacyError extends Error { }
export class PorscheActionFailedError extends Error { }
export class PorscheServerError extends Error { }

export class PorscheConnect extends PorscheConnectBase {
  public async getVehicles(): Promise<Vehicle[]> {
    const res = await this.getFromApi(this.routes.vehiclesURL);

    const vehicles: Vehicle[] = [];
    if (Array.isArray(res.data)) {
      await Promise.allSettled(
        res.data.map(async (v) => {
          const data = await Promise.allSettled([
            await this.getFromApi(this.routes.vehicleCapabilitiesURL(v.vin)),
            await this.getFromApi(this.routes.vehicleSummaryURL(v.vin)),
            await this.getFromApi(this.routes.vehiclePermissionsURL(v.vin)),
          ]);

          const capabilities = data[0].status == 'fulfilled' ? data[0].value.data : {};
          const summary = data[1].status == 'fulfilled' ? data[1].value.data : {};
          const permissions = data[2].status == 'fulfilled' ? data[2].value.data : {};

          const vehicleConfig: VehicleConfig = {
            vin: v.vin,
            modelDescription: v.modelDescription,
            modelType: v.modelType,
            modelYear: parseInt(v.modelYear),
            carModel: capabilities.carModel,
            engineType: capabilities.engineType,
            relationship: v.relationship,
            exteriorColor: v.exteriorColor,
            exteriorColorHex: v.exteriorColorHex,
            steeringWheelPosition: capabilities.steeringWheelPosition,
            nickName: summary.nickName,
            remoteCapabilities: {
              hasRDK: capabilities.hasRDK,
              hasHonkAndFlash: capabilities.hasHonkAndFlash,
              heating: {
                hasFrontSeatHeating: capabilities.heatingCapabilities.frontSeatHeatingAvailable,
                hasRearSeatHeating: capabilities.heatingCapabilities.rearSeatHeatingAvailable,
              },
            },
            permissions: {
              userIsActive: permissions.userIsActive,
              userRoleStatus: permissions.userRoleStatus,
            },
          };

          if (Array.isArray(v.pictures)) {
            vehicleConfig.pictures = [];
            for (const picture of v.pictures) {
              vehicleConfig.pictures.push({
                width: picture.width,
                height: picture.height,
                url: picture.url,
                view: picture.view,
                transparent: picture.transparent,
              });
            }
          }

          vehicles.push(new Vehicle(this, vehicleConfig));
        }),
      );
    }

    return vehicles;
  }

  protected async getFromApi(url: string): Promise<AxiosResponse> {
    const app = Application.getFromUrl(url);

    const auth = await this.authIfRequired(app);
    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
      origin: 'https://my.porsche.com',
      apikey: auth.apiKey,
      'x-vrs-url-country': this.env.country,
      'x-vrs-url-language': this.env.locale,
    };

    try {
      const result = await this.client.get(url, { headers });
      return result;
    } catch (e: any) {
      if (axios.isAxiosError(e) && e.response && e.response.status && e.response.status >= 500 && e.response.status <= 503) {
        throw new PorscheServerError();
      }
      throw new PorscheError();
    }
  }

  protected async getStatusFromApi(url: string, retries = 10): Promise<void> {
    // Limit retries
    for (let i = 0; i < retries; i++) {
      const res = await this.getFromApi(url);

      if ((res.data.status && res.data.status == 'IN_PROGRESS') || (res.data.actionState && res.data.actionState == 'IN_PROGRESS')) {
        // Wait 1 second before polling again
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      } else {
        const successStates = ['SUCCESS', 'SUCCESSFUL'];
        if (!successStates.includes(res.data.status) && !successStates.includes(res.data.actionState)) {
          throw new PorscheActionFailedError(`Non SUCCESS status returned: ${res.data.status ?? res.data.actionState}`);
        }

        return;
      }
    }

    return;
  }

  protected async postToApi(url: string, body: any = undefined): Promise<AxiosResponse> {
    const app = Application.getFromUrl(url);

    const auth = await this.authIfRequired(app);
    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
      origin: 'https://my.porsche.com',
      apikey: auth.apiKey,
      'x-vrs-url-country': this.env.country,
      'x-vrs-url-language': this.env.locale,
    };

    try {
      const result = await this.client.post(url, body, { headers });
      return result;
    } catch (e: any) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.data) {
          return e.response;
        }
        if (e.response.data && e.response.data['pcckErrorKey'] == 'GRAY_SLICE_ERROR_UNKNOWN_MSG') {
          throw new PorschePrivacyError();
        }
        if (e.response.status && e.response.status >= 500 && e.response.status <= 503) {
          throw new PorscheServerError();
        }
      }
      throw new PorscheError();
    }
  }
}

export interface PorscheConnect extends PorscheConnectAuth, PorscheConnectVehicle { }
applyMixins(PorscheConnect, [PorscheConnectAuth, PorscheConnectVehicle]);
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null));
    });
  });
}
