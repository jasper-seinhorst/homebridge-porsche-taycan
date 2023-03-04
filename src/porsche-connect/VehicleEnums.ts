export enum DoorStatus {
  ClosedUnlocked = 'CLOSED_UNLOCKED',
  ClosedLocked = 'CLOSED_LOCKED',
  Open = 'OPEN',
  Invalid = 'INVALID'
}

export enum OpenStatus {
  Closed = 'CLOSED',
  Open = 'Open'
}

export enum ParkingBreakStatus {
  Active = 'ACTIVE',
  Unactive = 'UNACTIVE'
}

export enum ParkingLightStatus {
  On = 'ON',
  Off = 'OFF'
}

export enum DistanceUnit {
  Kilometers = 'KILOMETER',
  Miles = 'MILE'
}

export enum SpeedUnit {
  Kmh = 'KMH',
  Mph = 'MPH'
}

export enum SteeringWheelPosition {
  Left = 'LEFT',
  Right = 'RIGHT'
}

export enum EngineType {
  Combustion = 'COMBUSTION',
  BatteryPowered = 'BEV',
  PluginHybrid = 'PHEV'
}

export enum PlugState {
  Connected = 'CONNECTED',
  Disconnected = 'DISCONNECTED'
}

export enum LockState {
  Locked = 'LOCKED',
  Unlocked = 'UNLOCKED'
}

export enum ChargingState {
  Charging = 'CHARGING',
  Off = 'OFF'
}

export enum ChargingStatus {
  NotCharging = 'NOT_CHARGING',
  Charging = 'CHARGING'
}

export enum ChargingMode {
  On = 'ON',
  Off = 'OFF'
}

export enum ClimatisationState {
  On = 'ON',
  Off = 'OFF'
}

export enum ChargeTimerFrequency {
  Cyclic = 'CYCLIC',
  Single = 'SINGLE'
}

export enum PressureUnit {
  Bar = 'BAR',
  Psi = 'PSI'
}

export enum FuelType {
  Gasoline = 'GASOLINE',
  Diesel = 'Diesel',
  Electric = 'Electric',
  Unsupported = 'UNSUPPORTED'
}

export enum WindowStatus {
  Closed = 'CLOSED',
  Open = 'OPEN',
  Invalid = 'INVALID',
  Unsupported = 'UNSUPPORTED'
}