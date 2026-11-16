const express = require('express');
const controller = require('../controllers/tripController');
const { requerirAuth } = require('../middleware/auth');
const {
  validar,
  validarIdParam,
  validarQueryIdOpcional,
} = require('../validators/helpers');
const tripValidators = require('../validators/tripValidators');

const router = express.Router();

router.use(requerirAuth);

router.get('/kilometros', controller.kilometrosResumen);
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
);
router.get(
  '/conductor/:conductorId',
  validarIdParam('conductorId'),
  validar,
  controller.historialPorConductor
);

router.get(
  '/',
  validarQueryIdOpcional('vehiculoId'),
  validarQueryIdOpcional('conductorId'),
  validar,
  controller.listar
);
router.get('/:id', validarIdParam('id'), validar, controller.obtener);
router.post('/', tripValidators.crear, validar, controller.crear);

module.exports = router;
