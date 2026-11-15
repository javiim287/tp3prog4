// Rutas CRUD de vehículos: /api/vehiculos
// Cada ruta de obtención, creación, actualización y eliminación pasa por su
// cadena de express-validator antes de llegar al controlador.
const express = require('express');
const controller = require('../controllers/vehicleController');
const { validar, validarIdParam } = require('../validators/helpers');
const vehicleValidators = require('../validators/vehicleValidators');

const router = express.Router();

router.get('/', controller.listar); // listar todos
router.get('/:id', validarIdParam('id'), validar, controller.obtener); // obtener por id
router.post('/', vehicleValidators.crear, validar, controller.crear); // crear
router.put('/:id', validarIdParam('id'), validar, vehicleValidators.actualizar, validar, controller.actualizar); // actualizar
router.delete('/:id', validarIdParam('id'), validar, controller.eliminar); // eliminar

module.exports = router;
