// Rutas de viajes: /api/viajes
// Las rutas de obtención (historial, kilómetros) y el registro de viajes
// pasan por su cadena de express-validator antes de llegar al controlador.
const express = require('express');
const controller = require('../controllers/tripController');
const {
  validar,
  validarIdParam,
  validarQueryIdOpcional,
} = require('../validators/helpers');
const tripValidators = require('../validators/tripValidators');

const router = express.Router();

// Las rutas de historial y kilómetros van antes que /:id para que no se
// interpreten como un id de viaje.
router.get('/kilometros', controller.kilometrosResumen); // resumen general
router.get(
  '/kilometros/vehiculo/:vehiculoId',
  validarIdParam('vehiculoId'),
  validar,
  controller.kilometrosPorVehiculo
);
router.get(
  '/kilometros/conductor/:conductorId',
  validarIdParam('conductorId'),
  validar,
  controller.kilometrosPorConductor
);
router.get(
  '/vehiculo/:vehiculoId',
  validarIdParam('vehiculoId'),
  validar,
  controller.historialPorVehiculo
); // historial por vehículo
router.get(
  '/conductor/:conductorId',
  validarIdParam('conductorId'),
  validar,
  controller.historialPorConductor
); // historial por conductor

router.get(
  '/',
  validarQueryIdOpcional('vehiculoId'),
  validarQueryIdOpcional('conductorId'),
  validar,
  controller.listar
); // listar todos (con filtros opcionales)
router.get('/:id', validarIdParam('id'), validar, controller.obtener); // obtener por id
router.post('/', tripValidators.crear, validar, controller.crear); // registrar viaje

module.exports = router;
