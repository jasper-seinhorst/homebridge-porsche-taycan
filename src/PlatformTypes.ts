import { PlatformAccessory } from 'homebridge';
import { Vehicle, VehicleEMobility } from 'porsche-connect';

export type PlatformVehicle = {
    vehicle: Vehicle;
    accessories: PorscheAccessory[];
};

export interface PorscheAccessory {
    accessory: PlatformAccessory;
    beat(emobilityInfo: VehicleEMobility, vehicle: Vehicle): void;
}