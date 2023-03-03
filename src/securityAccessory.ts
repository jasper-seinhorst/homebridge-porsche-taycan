import { Service, PlatformAccessory } from 'homebridge';
import { Vehicle } from './porsche-connect';

import { PorscheTaycanPlatform } from './platform';

export class PorscheSecurityAccessory {
    private vehicle: Vehicle;

    private frontLeftDoorService: Service;
    private frontRightDoorService: Service;
    private backLeftDoorService: Service;
    private backtRightDoorService: Service;

    private frontLeftWindowService: Service;
    private frontRightWindowService: Service;
    private backLeftWindowService: Service;
    private backtRightWindowService: Service;

    constructor(
        private readonly platform: PorscheTaycanPlatform,
        private readonly accessory: PlatformAccessory,

    ) {
        this.vehicle = new Vehicle(this.platform.PorscheConnectAuth, this.accessory.context.device);

        this.frontLeftDoorService = this.accessory.getService('Front left door')
            || this.accessory.addService(this.platform.Service.ContactSensor, 'Front left door', `${this.vehicle.vin}-door-fl`);
        this.frontRightDoorService = this.accessory.getService('Front right door')
            || this.accessory.addService(this.platform.Service.ContactSensor, 'Front right door', `${this.vehicle.vin}-door-fr`);
        this.backLeftDoorService = this.accessory.getService('Back left door')
            || this.accessory.addService(this.platform.Service.ContactSensor, 'Back left door', `${this.vehicle.vin}-door-bl`);
        this.backtRightDoorService = this.accessory.getService('Back right door')
            || this.accessory.addService(this.platform.Service.ContactSensor, 'Back right door', `${this.vehicle.vin}-door-br`);

        this.frontLeftWindowService = this.accessory.getService('Front left window')
            || this.accessory.addService(this.platform.Service.ContactSensor, 'Front left window', `${this.vehicle.vin}-window-fl`);
        this.frontRightWindowService = this.accessory.getService('Front right window')
            || this.accessory.addService(this.platform.Service.ContactSensor, 'Front right window', `${this.vehicle.vin}-window-fr`);
        this.backLeftWindowService = this.accessory.getService('Back left window')
            || this.accessory.addService(this.platform.Service.ContactSensor, 'Back left window', `${this.vehicle.vin}-window-bl`);
        this.backtRightWindowService = this.accessory.getService('Back right window')
            || this.accessory.addService(this.platform.Service.ContactSensor, 'Back right window', `${this.vehicle.vin}-window-br`);

        this.initialise();
    }

    async initialise() {
        // get initial state
        this.getSecurityState();

        // refresh state every X minutes
        const interval = this.platform.config.pollInterval || 10;
        this.platform.log.debug('Interval security ->', this.platform.config.pollInterval);
        setInterval(() => {
            this.getSecurityState();
        }, (interval * 60 * 1000));
    }

    async getSecurityState() {
        this.platform.log.debug('Retrieving Security Characteristic form Porsche Connect API');
        const overviewData = await this.vehicle.getCurrentOverview();

        if (overviewData.doors) {
            this.platform.log.debug('Set Characteristic Doors ->', overviewData.doors);
            this.frontLeftDoorService
                .setCharacteristic(this.platform.Characteristic.ContactSensorState, this.getDoorState(overviewData.doors.frontLeft));
            this.frontRightDoorService
                .setCharacteristic(this.platform.Characteristic.ContactSensorState, this.getDoorState(overviewData.doors.frontRight));
            this.backLeftDoorService
                .setCharacteristic(this.platform.Characteristic.ContactSensorState, this.getDoorState(overviewData.doors.backLeft));
            this.backtRightDoorService
                .setCharacteristic(this.platform.Characteristic.ContactSensorState, this.getDoorState(overviewData.doors.backRight));
        }

        if (overviewData.windows) {
            this.platform.log.debug('Set Characteristic Windows ->', overviewData.windows);

            this.frontLeftWindowService
                .setCharacteristic(this.platform.Characteristic.ContactSensorState, this.getWindowState(overviewData.windows.frontLeft));
            this.frontRightWindowService
                .setCharacteristic(this.platform.Characteristic.ContactSensorState, this.getWindowState(overviewData.windows.frontRight));
            this.backLeftWindowService
                .setCharacteristic(this.platform.Characteristic.ContactSensorState, this.getWindowState(overviewData.windows.backLeft));
            this.backtRightWindowService
                .setCharacteristic(this.platform.Characteristic.ContactSensorState, this.getWindowState(overviewData.windows.backRight));
        }
    }

    getDoorState(state) {
        if (state === 'CLOSED_LOCKED' || state === 'CLOSED_UNLOCKED') {
            return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
        }

        return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    }

    getWindowState(state) {
        if (state === 'CLOSED') {
            return this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
        }

        return this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    }

}
