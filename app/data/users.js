// app/data/models/user.js
const dynamoose = require('dynamoose');

const userSchema = new dynamoose.Schema({
    userId: {type: Number, default: 0},
    nombre: { type: String },
    apellidoP: { type: String },
    apellidoM: { type: String },
    telefono: { type: Number },
    correo: { type: String, hashKey: true },
    password: { type: String },
    edad: { type: Number, default: -1, min: 18, max: 85 },
    carrera: { type: String, default: "" },
    marcaVehiculo: { type: String, default: "" },
    modeloVehiculo: { type: String, default: "" },
    yearVehiculo: { type: Number, default: -1, min: 2005, max: 2025 },
    colorVehiculo: { type: String, default: "" },
    placa: { type: String, default: "" }
});

const User = dynamoose.model('Users', userSchema);
module.exports = User;