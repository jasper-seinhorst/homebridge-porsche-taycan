import { PlatformAccessory } from 'homebridge';
import { Vehicle, VehicleEMobility, VehiclePosition } from 'porsche-connect';

export type PlatformVehicle = {
    vehicle: Vehicle;
    accessories: PorscheAccessory[];
};

export interface PorscheAccessory {
    accessory: PlatformAccessory;
    displayName?: string;
    beat(emobilityInfo: VehicleEMobility, positionInfo : VehiclePosition, vehicle: Vehicle): void;
}