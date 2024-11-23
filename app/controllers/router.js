const express = require('express');
const path = require('path');
const router = express.Router();
const travelRouter = require('./../routes/viajes.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const dynamoose = require('../data/dynamoose.js');
const User = require('../data/users.js');
const UserBak = require('../data/usersbak.js');
const Viaje = require('../data/travels.js');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({ region: 'us-east-2' });

async function enviarNotificacionRegistro(usuarioData) {
    const params = {
        FunctionName: 'Send_email_py',
        InvocationType: 'Event', 
        Payload: JSON.stringify(usuarioData)
    };

    try {
        await lambda.invoke(params).promise();
        console.log("Notificación de registro enviada con éxito.");
    } catch (error) {
        console.error("Error al invocar Lambda: ", error);
    }
}

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token


    if (!token) {
        return res.status(401).json({ message: 'Acceso no autorizado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, 'clave_secreta');  // Asegúrate de usar tu clave secreta real
        req.userId = decoded.userId; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Acceso no autorizado. Token inválido.' });
    }
};


router.post('/register', async (req, res) => {
    try {
        const userData = req.body;

        const existingUser_query = await User.query("correo").eq(userData.correo).exec();
        const existingUser = existingUser_query[0];

        if (existingUser) {
            return res.status(400).json({ message: 'Ya existe un usuario con ese correo electrónico.' });
        }

        const hashedPass = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPass;
        userData.telefono = parseInt(userData.telefono);
        const newUser = new User(userData);
        
        User.create(newUser, (error, results) => {
            if (error) {
                console.log(error.message);
                res.status(500).send('Error al crear usuario: ' + error.message);
            } else {
                UserBak.create(newUser, (error, results) => {
                  if (error) {
                    res.status(500).send('Error al crear usuario: ' + error.message);
                  }
                })
                
                enviarNotificacionRegistro(results);

                res.status(201).send("Usuario registrado con éxito");
            }
        });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        const user_query = await User.query("correo").eq(correo).limit(1).exec();
        const user = user_query[0];

        if (!user) {
            return res.status(401).json('Credenciales no válidas.');
        }
        
        // Verificación correcta de la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json('Credenciales no válidas.');
        }

        // Generación del token JWT
        const token = jwt.sign({ userId: user._id }, 'clave_secreta', { expiresIn: '2h' });
        res.status(200).json(token);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/update-profile/:email', verifyToken, async (req, res) => {
    const correo = decodeURIComponent(req.params.email);
    const updates = req.body;
    const validUpdates = {};

    // Filtra y conserva solo los campos que no están vacíos
    Object.keys(updates).forEach(key => {
        if (updates[key] !== '' && updates[key] != null) {
            validUpdates[key] = updates[key];
        }
    });
    const numInputs = ['telefono', 'edad', 'yearVehiculo'];
    for (let i = 0; i < 3; i++) {
        if (validUpdates[numInputs[i]])
            validUpdates[numInputs[i]] = parseInt(validUpdates[numInputs[i]]);
    }
    
    try {
        const user_query = await User.query("correo").eq(correo).limit(1).exec();
        const user = user_query[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        User.update({"correo": correo}, validUpdates, (error, results) => {
            if (error) {
                res.status(500).json({ message: 'Error interno del servidor.' });
            } else {
                UserBak.update({"correo": correo}, validUpdates, (error, results) => {});
                res.status(200).json({ message: 'Perfil actualizado correctamente.', results });
            }
        })
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

router.get('/profile-data/:email', verifyToken, async (req, res) => {
    const correo = decodeURIComponent(req.params.email);

    try {
        const user_query = await User.query("correo").eq(correo).limit(1).exec();
        const user = user_query[0];

        console.log(user_query);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Seleccionamos los campos que queremos devolver para evitar enviar información sensible
        const userProfile = {
            nombre: user.nombre,
            apellidoP: user.apellidoP,
            apellidoM: user.apellidoM,
            telefono: user.telefono,
            edad: user.edad,
            correo: user.correo,
            carrera: user.carrera,
            marcaVehiculo: user.marcaVehiculo,
            modeloVehiculo: user.modeloVehiculo,
            yearVehiculo: user.yearVehiculo,
            colorVehiculo: user.colorVehiculo,
            placa: user.placa
            // Añade otros campos que necesites
        };

        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error al obtener los datos del perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

router.get('/profile-name/:email', verifyToken, async (req, res) => {
    const email = decodeURIComponent(req.params.email);
    
    try {
        const user_query = await User.query("correo").eq(email).limit(1).exec();
        const user = user_query[0];
        if (!user) {
            return res.status(404).json({ message: 'Conductor no encontrado.' });
        }

        // Seleccionamos los campos que queremos devolver
        const driverProfile = {
            nombre: user.nombre,
            apellidoP: user.apellidoP,
            apellidoM: user.apellidoM,
            telefono: user.telefono,
            marcaVehiculo: user.marcaVehiculo,
            modeloVehiculo: user.modeloVehiculo,
            yearVehiculo: user.yearVehiculo,
            colorVehiculo: user.colorVehiculo,
            placa: user.placa
        };

        res.status(200).json(driverProfile);
    } catch (error) {
        console.error('Error al obtener los datos del conductor:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


router.post('/register-travel', verifyToken, async (req, res) => {
    let travelData = req.body;
    const expectedAttr = ['zone', 'driver', 'hour', 'disponibility'];
    const missingAttr = expectedAttr.filter(attr => !travelData.hasOwnProperty(attr));

    if (missingAttr.length) {
        return res.status(400).send(`Missing attributes: ${missingAttr.join(', ')}`);
    }

    try {
        const newTravel = new Viaje(travelData);
        
        Viaje.create(newTravel, (error, results) => {
            if (error) {
                res.status(500).send("Error creating travel: " + error.message);
            } else {
                res.status(201).json({"Message": "Travel created", "Travel": newTravel});
            }
        });
    } catch (error) {
        console.error('Error al registrar el viaje:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

/*
    Ignore this function
*/
// En tu archivo de rutas del servidor, por ejemplo en router.js
router.get('/get-user-email', verifyToken, async (req, res) => {
    try {
        const user_query = await User.query("userId").eq("sdas").limit().exec();
        const user = user_query[0];
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ email: user.correo });
    } catch (error) {
        console.error('Error al obtener el correo del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});












router.use('/travels', travelRouter);

router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../views/home.html'));
});

router.get('/home', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../views/home.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../views/login.html'));
});

router.get('/perfil', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../views/perfil.html'));
});

router.get('/viajar', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../views/viajar.html'));
});

router.get('/viajes', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../views/viajes.html'));
});

router.get('/agregarViajes', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../views/agregarViajes.html'));
});

router.use('/travels', travelRouter); 

module.exports = router;
