const dynamoose = require('dynamoose');
const utils = require('../controllers/utils');

const travelSchema = new dynamoose.Schema({
    uuid: { type: String, required: true, default: utils.generateUUID(), hashKey: true },
    zone: { type: String, required: true, default: "" },
    driver: { type: String, required: true, default: "" },
    hour: { type: String, required: true, default: "" },
    disponibility: { type: Number, required: true},
    passengers: { type: Array, schema: [{ type: String }], default: [] },
    days: { type: String, required: true, default: "" }
});

const Travel = dynamoose.model('Travels', travelSchema);

module.exports = Travel;