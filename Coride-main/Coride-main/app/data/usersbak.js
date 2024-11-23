// app/data/models/user.js
const dynamoose = require('dynamoose');

const userSchema = new dynamoose.Schema({
    userId: {type: Number, default: null},
    nombre: { type: String },
    apellidoP: { type: String },
    apellidoM: { type: String },
    telefono: { type: Number },
    correo: { type: String, hashKey: true },
    password: { type: String },
    edad: { type: Number, default: null, min: 18, max: 85 },
    carrera: { type: String, default: null },
    marcaVehiculo: { type: String, default: null },
    modeloVehiculo: { type: String, default: null },
    yearVehiculo: { type: Number, default: null, min: 2005, max: 2025 },
    colorVehiculo: { type: String, default: null },
    placa: { type: String, default: null }
});

const UserBak = dynamoose.model('Users_bak', userSchema);
module.exports = UserBak;