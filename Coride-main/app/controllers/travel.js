const { generateUUID } = require('./utils');


class TravelException {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

class Travel {
    constructor(uuid, zone, driver, hour, disponibility, passengers, days) {
        this._uuid = uuid || generateUUID();
        this.zone = zone;
        this.driver = driver;
        this.hour = hour;
        this.disponibility = disponibility;
        this.passengers = passengers || [];
        this.days = days;
    }

    get uuid() {
        return this._uuid;
    }

    get zone() {
        return this._zone;
    }
    set zone(value) {
        if (typeof value !== "string" || value.trim() === '') throw new TravelException("Zone cannot be empty");
        this._zone = value;
    }

    get driver() {
        return this._driver;
    }
    set driver(value) {
        if (typeof value !== "string" || value.trim() === '') throw new TravelException("Driver name cannot be empty");
        this._driver = value;
    }

    get hour() {
        return this._hour;
    }
    set hour(value) {
        if (typeof value !== "string" || value.trim() === '') throw new TravelException("Hour cannot be empty");
        this._hour = value;
    }

    get disponibility() {
        return this._disponibility;
    }
    set disponibility(value) {
        if (typeof value !== "number" || value < 0) throw new TravelException("Invalid disponibility value");
        this._disponibility = value;
    }

    get confirmed() {
        return this._confirmed;
    }
    set confirmed(value) {
        if (typeof value !== "boolean") throw new TravelException("Confirmed must be a boolean");
        this._confirmed = value;
    }

    get days() {
        return this._days;
    }
    set days(value) {
        if (!Array.isArray(value) || value.some(day => typeof day !== "string")) {
            throw new TravelException("Days must be an array of strings");
        }
        this._days = value;
    }

    static createFromJson(jsonValue) {
        let obj = JSON.parse(jsonValue);
        return this.createFromObject(obj);
    }

    static createFromObject(obj) {
        return new Travel(
            obj.uuid, obj.zone, obj.driver, obj.hour, obj.disponibility, obj.confirmed, obj.days
        );
    }
}

module.exports = Travel;
