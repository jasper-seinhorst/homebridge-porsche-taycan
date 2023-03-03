import type { Environment } from './Environment';

export class Routes {
  private env: Environment;

  public constructor(locale: Environment) {
    this.env = locale;
  }

  public get loginAuthURL(): string {
    return `https://login.porsche.com/auth/api/v1/${this.env.country}/${this.env.locale}/public/login`;
  }

  public get apiAuthURL(): string {
    return 'https://login.porsche.com/as/authorization.oauth2';
  }

  public get apiTokenURL(): string {
    return 'https://login.porsche.com/as/token.oauth2';
  }

  public get vehiclesURL(): string {
    return `https://api.porsche.com/core/api/v3/${this.env.country}/${this.env.locale}/vehicles`;
  }

  public vehiclePermissionsURL(vin: string): string {
    return `https://api.porsche.com/core/api/v2/${this.env.country}/${this.env.locale}/vehicles/${vin}/permissions`;
  }

  public vehicleSummaryURL(vin: string): string {
    return `https://api.porsche.com/service-vehicle/vehicle-summary/${vin}`;
  }

  public vehicleCapabilitiesURL(vin: string): string {
    return `https://api.porsche.com/service-vehicle/vcs/capabilities/${vin}`;
  }

  public vehiclePositionURL(vin: string): string {
    return `https://api.porsche.com/service-vehicle/car-finder/${vin}/position`;
  }

  public vehicleEmobilityURL(vin: string, carModel: string): string {
    return `https://api.porsche.com/e-mobility/${this.env.country}/${this.env.locale}/${carModel}/${vin}?timezone=${this.env.timeZone}`;
  }

  public vehicleToggleDirectChargingURL(vin: string, carModel: string, on: boolean): string {
    const action = on ? 'true' : 'false';
    return `https://api.porsche.com/e-mobility/${this.env.country}/${this.env.locale}/${carModel}/${vin}/toggle-direct-charging/${action}`;
  }

  public vehicleToggleDirectChargingStatusURL(vin: string, carModel: string, requestId: string): string {
    return `https://api.porsche.com/e-mobility/${this.env.country}/${this.env.locale}/${carModel}/${vin}/toggle-direct-charging/status/${requestId}`;
  }

  public vehicleToggleClimateURL(vin: string, on: boolean): string {
    const action = on ? 'true' : 'false';
    return `https://api.porsche.com/e-mobility/${this.env.country}/${this.env.locale}/${vin}/toggle-direct-climatisation/${action}`;
  }

  public vehicleToggleClimateStatusURL(vin: string, requestId: string): string {
    return `https://api.porsche.com/e-mobility/${this.env.country}/${this.env.locale}/${vin}/toggle-direct-climatisation/status/${requestId}`;
  }

  public vehicleToggleLockedURL(vin: string, lock: boolean): string {
    const action = lock ? 'lock' : 'unlock';
    return `https://api.porsche.com/service-vehicle/remote-lock-unlock/${vin}/${action}`;
  }

  public vehicleToggleLockedStatusURL(vin: string, requestId: string): string {
    return `https://api.porsche.com/service-vehicle/remote-lock-unlock/${vin}/${requestId}/status`;
  }

  public vehicleHonkAndOrFlashURL(vin: string, honkAlso: boolean): string {
    const action = honkAlso ? 'honk-and-flash' : 'flash';
    return `https://api.porsche.com/service-vehicle/honk-and-flash/${vin}/${action}`;
  }

  public vehicleHonkAndOrFlashStatusURL(vin: string, requestId: string): string {
    return `https://api.porsche.com/service-vehicle/honk-and-flash/${vin}/${requestId}/status`;
  }

  public vehicleStoredOverviewURL(vin: string): string {
    return `https://api.porsche.com/service-vehicle/${this.env.country}/${this.env.locale}/vehicle-data/${vin}/stored`;
  }

  public vehicleCurrentOverviewInvokeURL(vin: string): string {
    return `https://api.porsche.com/service-vehicle/${this.env.country}/${this.env.locale}/vehicle-data/${vin}/current/request`;
  }

  public vehicleCurrentOverviewStatusURL(vin: string, requestId: string): string {
    return `https://api.porsche.com/service-vehicle/${this.env.country}/${this.env.locale}/vehicle-data/${vin}/current/request/${requestId}/status`;
  }

  public vehicleCurrentOverviewDataURL(vin: string, requestId: string): string {
    return `https://api.porsche.com/service-vehicle/${this.env.country}/${this.env.locale}/vehicle-data/${vin}/current/request/${requestId}`;
  }

  public vehicleMaintenanceInfoURL(vin: string): string {
    return `https://api.porsche.com/predictive-maintenance/information/${vin}`;
  }

  public vehicleTripsUrl(vin: string, longTerm: boolean): string {
    const term = longTerm ? 'LONG_TERM/newest' : 'SHORT_TERM';
    return `https://api.porsche.com/service-vehicle/${this.env.country}/${this.env.locale}/trips/${vin}/${term}`;
  }
}
