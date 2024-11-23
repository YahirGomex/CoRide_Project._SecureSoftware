const Travel = require('./travel');
const { generateUUID } = require('./utils');
const fs = require('fs');
const path = require('path');

const travelsFilePath = path.resolve(__dirname, '../data/travel.json');
let travels = [];

function loadTravels() {
    const data = fs.readFileSync(travelsFilePath, 'utf8');
    travels = JSON.parse(data);
}

function saveTravels() {
    fs.writeFileSync(travelsFilePath, JSON.stringify(travels, null, 2), 'utf8');
}

loadTravels();

function getTravels() {
    return travels;
}

function getTravelById(uuid) {
    return travels.find(travel => travel.uuid === uuid);
}

function createTravel(travel) {
    let newTravel = new Travel(travel.uuid, travel.zone, travel.driver, travel.hour, travel.disponibility);
    travels.push(newTravel);
    saveTravels();
    return newTravel;
}

function updateTravel(uuid, updateTravel) {
    const index = travels.findIndex(travel => travel.uuid === uuid);
    if (index !== -1) {
        Object.assign(travels[index], updateTravel);
        saveTravels();
        return travels[index];
    }
}

function deleteTravel(uuid) {
    const travelIndex = travels.findIndex(travel => travel.uuid === uuid);
    if(travelIndex !== -1) {
        travels.splice(travelIndex, 1);
        console.log("Viaje eliminado");
        saveTravels();
        return true;
    } else {
        console.log("Viaje no encontrado");
        return false;
    }
}

function findTravel(travels, zone, driver) {
    if (!zone && !driver) {
        return travels;
    }

    return travels.filter(travel => 
        (!zone || travel.zone.toLowerCase() === zone.toLowerCase()) &&
        (!driver || travel.travels.toLowerCase().includes(driver.toLowerCase()))
    );
}

function filterTravels(query) {
    return travels.filter(travel => travel.zone.toLowerCase() === query.toLowerCase());
}

exports.getTravels = getTravels;
exports.getTravelById = getTravelById;
exports.createTravel = createTravel;
exports.updateTravel = updateTravel;
exports.deleteTravel = deleteTravel;
exports.findTravel = findTravel;
exports.filterTravels = filterTravels;
