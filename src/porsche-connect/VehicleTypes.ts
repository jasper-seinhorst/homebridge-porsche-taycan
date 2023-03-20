import type { Moment } from 'moment';

import type {
  EngineType,
  SteeringWheelPosition,
  PlugState,
  ChargingState,
  ChargingMode,
  ChargingStatus,
  SpeedUnit,
  DistanceUnit,
  DoorStatus,
  OpenStatus,
  ParkingBreakStatus,
  ParkingLightStatus,
  PressureUnit,
  FuelType,
  WindowStatus
} from './VehicleEnums';

export type VehicleConfig = {
  vin: string;
  modelDescription: string;
  modelType: string;
  modelYear: number;
  carModel: string;
  engineType: EngineType;
  relationship?: string;
  exteriorColor?: string;
  exteriorColorHex?: string;
  steeringWheelPosition: SteeringWheelPosition;
  pictures?: VehiclePicture[];
  nickName?: string | null;
  remoteCapabilities: VehicleCapabilities;
  permissions: {
    userIsActive: boolean;
    userRoleStatus: 'ENABLED' | string;
  };
};

export type VehicleCapabilities = {
  hasRDK?: boolean;
  hasHonkAndFlash?: boolean;
  heating?: {
    hasFrontSeatHeating?: boolean;
    hasRearSeatHeating?: boolean;
  };
};

export type VehiclePicture = {
  width: number;
  height: number;
  url: string;
  view: string;
  transparent: boolean;
};

export type VehicleEMobility = {
  batteryChargeStatus: {
    plugState: PlugState;
    chargingState: ChargingState;
    chargingReason: string; // 'INVALID'
    externalPowerSupplyState: string; // 'UNAVAILABLE'
    chargingMode: ChargingMode;
    stateOfChargeInPercentage: number;
    remainingChargeTimeUntil100PercentInMinutes: number | null;
    remainingERange: {
      value: number;
      unit: 'KILOMETER' | string;
      originalValue: number;
      originalUnit: 'KILOMETER' | string;
      valueInKilometers: number;
    };
    remainingCRange: null;
    chargingTargetDateTime: Moment;
    status: null;
    chargeRate: {
      value: number;
      unit: 'KM_PER_MIN' | string;
      valueInKmPerHour: number;
    };
    chargingPower: number; // kW
    chargingTargetDateTimeOplEnforced: null;
    chargingInDCMode: boolean;
  };
  directCharge: {
    disabled: boolean;
    isActive: boolean;
  };
  directClimatisation: {
    climatisationState: 'ON' | 'OFF';
    remainingClimatisationTime: number | null;
  };
  chargingStatus: ChargingStatus;
  timers: ChargingTimer[];
  climateTimer: null;
  chargingProfiles: {
    currentProfileId: number;
    profiles: ChargingProfile[];
  };
};

export type ChargingTimer = {
  timerID: string; // '1'
  departureDateTime: Moment;
  preferredChargingTimeEnabled: boolean;
  preferredChargingStartTime: null;
  preferredChargingEndTime: null;
  climatised: boolean;
  weekDays: {
    MONDAY: boolean;
    TUESDAY: boolean;
    WEDNESDAY: boolean;
    THURSDAY: boolean;
    FRIDAY: boolean;
    SATURDAY: boolean;
    SUNDAY: boolean;
  } | null;
  active: boolean;
  chargeOption: boolean;
  targetChargeLevel: number;
  e3_CLIMATISATION_TIMER_ID: string; // '1'
  climatisationTimer: boolean;
};

export type ChargingProfile = {
  chargingOptions: {
    minimumChargeLevel: number;
    preferredChargingEnabled: boolean;
    preferredChargingTimeEnd: string; // '07:15'
    preferredChargingTimeStart: string; // '07:00'
    smartChargingEnabled: boolean;
  };
  position: {
    latitude: number;
    longitude: number;
  };
  profileActive: boolean;
  profileId: number;
  profileName: string;
};

export type VehiclePosition = {
  carCoordinate: {
    latitude: number;
    longitude: number;
  };
  heading: number;
};

export type TripInfo = {
  type: 'LONG_TERM' | 'SHORT_TERM';
  id: number;
  averageSpeed: {
    value: number;
    unit: SpeedUnit;
    valueInKmh: number;
  };
  averageFuelConsumption: {
    value: number;
    unit: 'LITERS_PER_100_KM';
    valueInLitersPer100Km: number;
  };
  tripMileage: {
    value: number;
    unit: DistanceUnit;
    originalValue: number;
    originalUnit: DistanceUnit;
    valueInKilometers: number;
  };
  travelTime: number;
  startMileage: {
    value: number;
    unit: DistanceUnit;
    originalValue: 6;
    originalUnit: DistanceUnit;
    valueInKilometers: number;
  };
  endMileage: {
    value: number;
    unit: DistanceUnit;
    originalValue: number;
    originalUnit: DistanceUnit;
    valueInKilometers: number;
  };
  timestamp: Moment;
  zeroEmissionDistance: {
    value: number;
    unit: DistanceUnit;
    originalValue: number;
    originalUnit: DistanceUnit;
    valueInKilometers: number;
  };
  averageElectricEngineConsumption: {
    value: number;
    unit: 'KWH_PER_100KM';
    valueKwhPer100Km: number;
  };
};

export type VehicleOverview = {
  batteryLevel: {
    unit: 'PERCENT';
    value: number;
  } | null;
  doors: {
    frontLeft: DoorStatus;
    frontRight: DoorStatus;
    backLeft?: DoorStatus;
    backRight?: DoorStatus;
    frontTrunk?: DoorStatus;
    backTrunk?: DoorStatus;
    overallLockStatus: DoorStatus;
  };
  fuelLevel: {
    value: number;
    unit: 'PERCENT';
  } | null;
  mileage: {
    value: number;
    unit: DistanceUnit;
    originalValue: number;
    originalUnit: DistanceUnit;
    valueInKilometers: number;
  };
  oilLevel: null;
  overallOpenStatus: OpenStatus;
  parkingBreak: ParkingBreakStatus;
  parkingBreakStatus: null;
  parkingLight: ParkingLightStatus;
  parkingLightStatus: null;
  parkingTime: Moment;
  remainingRanges: {
    conventionalRange: Range | null;
    electricalRange: Range | null;
  };
  serviceIntervals: {
    oilService: ServiceInterval;
    inspection: ServiceInterval;
  };
  tires: {
    frontLeft: TyreInfo;
    frontRight: TyreInfo;
    backLeft: TyreInfo;
    backRight: TyreInfo;
  };
  vin: string;
  windows: {
    backLeft?: WindowStatus;
    backRight?: WindowStatus;
    frontLeft: WindowStatus;
    frontRight: WindowStatus;
    maintenanceHatch?: WindowStatus;
    roof?: WindowStatus;
    sunroof?: {
      status: WindowStatus;
      positionInPercent: number | null;
    };
  };
};

export type Range = {
  distance: {
    originalUnit: DistanceUnit;
    originalValue: number;
    unit: DistanceUnit;
    value: number;
    valueInKilometers: number;
  } | null;
  engineType: FuelType;
  isPrimary: boolean;
};

export type ServiceInterval = {
  time: {
    unit: 'DAYS';
    value: number;
  } | null;
  distance: {
    originalUnit: DistanceUnit;
    originalValue: number;
    unit: DistanceUnit;
    value: number;
    valueInKilometers: number;
  } | null;
};

export type TyreInfo = {
  currentPressure: {
    value: number;
    unit: PressureUnit;
    valueInBar: number;
  } | null;
  differencePressure: {
    value: number;
    unit: PressureUnit;
    valueInBar: number;
  } | null;
  optimalPressure: {
    value: number;
    unit: PressureUnit;
    valueInBar: number;
  } | null;
  tirePressureDifferenceStatus: 'DIVERGENT' | 'UNKNOWN';
};
