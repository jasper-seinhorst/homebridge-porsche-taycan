import { PlatformAccessory } from 'homebridge';
import { Vehicle, VehicleConfig, VehicleEMobility } from './porsche-connect';

export type PlatformVehicle = {
    vehicle: VehicleConfig;
    accessories: PorscheAccessory[];
};

export interface PorscheAccessory {
    accessory: PlatformAccessory;
    beat(emobilityInfo: VehicleEMobility, vehicle: Vehicle): void;
}