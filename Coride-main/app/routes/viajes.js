const express = require('express');
const router = express.Router();
const Travel = require('../data/travels');  // Asegúrate de tener un modelo Dynamoose llamado Travel
const dynamoose = require('dynamoose');

// Ruta para obtener todos los viajes o filtrarlos por zona
router.get('/', async (req, res) => {
    if (req.query.zone)
    {
        let zone = req.query.zone;
        try {
            const condition = new dynamoose.Condition().where("zone").contains(zone);
            Travel.scan(condition).exec((error, results) => {
                if (error) {
                    res.status(400).send("Error: " + error.message);
                } else {
                    res.status(200).json(results);
                }
            });
        } catch (e) {
            res.status(400).send("Error: " + e.message);
        }
    } else {
        try {
            Travel.scan().exec((error, results) => {
                if (error) {
                    res.status(400).send("Error: " + error.message);
                } else {
                    res.status(200).json(results);
                }
            });
        } catch (e) {
            res.status(400).send("Error: " + e.message);
        }
    }
});

// En tu archivo de rutas, por ejemplo, viajes.js
router.get('/travel-data', async (req, res) => {
    try {
        Travel.scan().exec((error, results) => {
            if (error) {
                res.status(500).send("Error al obtener los datos de los viajes: " + error.message);
            } else {
                res.status(200).json(results);
            }
        });
    } catch (e) {
        res.status(400).send("Error " + e.message);
    }
});



// Ruta para obtener un viaje específico por UUID
router.get('/:uuid', async (req, res) => {

    try {
        Travel.query("uuid").eq(req.params.uuid).limit(1).exec((error, results) => {
            if (error) {
                res.status(400).send("Query error: " + error.message);
            } else {
                if (!results[0]) {
                    res.status(404).send("Travel not found");
                } else {
                    res.status(200).json(results[0]);
                }
            }
        });
    } catch (e) {
        res.status(400).send("Error " + e.message);
    }
});

// Ruta para crear un nuevo viaje
router.post('/', async (req, res) => {
    let travelData = req.body;
    const expectedAttr = ['zone', 'driver', 'hour', 'disponibility'];
    const missingAttr = expectedAttr.filter(attr => !travelData.hasOwnProperty(attr));

    if (missingAttr.length) {
        return res.status(400).send(`Missing attributes: ${missingAttr.join(', ')}`);
    }

    let newTravel = new Travel(travelData);

    Travel.create(newTravel, (error, results) => {
        if (error) {
            res.status(500).send('Error creating travel: ' + error.message);
        } else {
            res.status(201).json({"Message": "Travel created", "Travel": newTravel});
        }
    })
});

// Rutas para actualizar y eliminar un viaje existente
router.route('/:uuid')
    .put(async (req, res) => {
        let travelData = req.body;

        Travel.update({"uuid": req.params.uuid}, travelData, (error, results) => {
            if (error) {
                res.status(404).send('Travel not found');
            } else {
                res.status(200).json({"Status": "Successful", "Travel Updated": results});
            }
        })
    })
    .delete(async (req, res) => {
        Travel.delete({"uuid": req.params.uuid}, (error, results) => {
            if (error) {
                res.status(500).send('Error deleting travel: ' + error.message);
            } else {
                res.status(200).send('Travel deleted');
            }
        })
    });

// Confirmar una reserva
router.post('/:uuid/confirm', async (req, res) => {
    try {
        const travel_query = await Travel.query("uuid").eq(req.params.uuid).exec();
        const travel = travel_query[0]
        if (travel && travel.disponibility > 0) {
            travel.disponibility--;
            travel.passengers.push(req.body.correo);
            
            Travel.update({"uuid": req.params.uuid}, {"disponibility": travel.disponibility, "passengers": travel.passengers}, (error, results) => {
                if (error) {
                    res.status(500).send('Error updating travel: ' + error.message);
                } else {
                    res.status(200).json(travel);
                }
            })
        } else {
            if (travel) {
                res.status(409).send('No seats available');
            } else {
                res.status(404).send('Travel not found');
            }
        }
    } catch (e) {
        res.status(500).send('Error confirming travel: ' + e.message);
    }
});

// Cancelar una reserva
// Cancelar una reserva
router.post('/:uuid/cancel', async (req, res) => {

    try {
        const travel_query = await Travel.query("uuid").eq(req.params.uuid).exec();
        const travel = travel_query[0];
        if (travel && travel.passengers.includes(req.body.correo)) {
            travel.disponibility++;
            travel.passengers = travel.passengers.filter(email => email !== req.body.correo);
            Travel.update({"uuid": req.params.uuid}, {"disponibility": travel.disponibility, "passengers": travel.passengers}, (error, results) => {
                if (error) {
                    res.status(400).send('Error updating travel: ' + error.message);
                } else {
                    res.status(200).json(travel);
                }
            });
        } else {
            if (travel) {
                res.status(409).send('No reservation to cancel');
            } else {
                res.status(404).send('Travel not found');
            }
        }
    } catch (e) {
        res.status(500).send('Error canceling travel: '+ e.message);
    }
});



module.exports = router
