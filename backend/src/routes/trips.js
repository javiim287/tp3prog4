// Rutas de viajes: /api/viajes
const express = require('express');
const controller = require('../controllers/tripController');

const router = express.Router();

// Las rutas de historial y kilómetros van antes que /:id para que no se
// interpreten como un id de viaje.
router.get('/kilometros', controller.kilometrosResumen); // resumen general
router.get('/kilometros/vehiculo/:vehiculoId', controller.kilometrosPorVehiculo);
router.get('/kilometros/conductor/:conductorId', controller.kilometrosPorConductor);
router.get('/vehiculo/:vehiculoId', controller.historialPorVehiculo); // historial por vehículo
router.get('/conductor/:conductorId', controller.historialPorConductor); // historial por conductor

router.get('/', controller.listar); // listar todos (con filtros opcionales)
router.get('/:id', controller.obtener); // obtener por id
router.post('/', controller.crear); // registrar viaje (asocia vehículo + conductor)

module.exports = router;
