import { PlatformAccessory } from "homebridge";
import { VehicleConfig, VehicleEMobility } from "./porsche-connect";

export type PlatformVehicle = {
    vehicle: VehicleConfig,
    accessories: PorscheAccessory[]
}

export interface PorscheAccessory {
    accessory: PlatformAccessory;
    update(emobilityInfo: VehicleEMobility): void;
}