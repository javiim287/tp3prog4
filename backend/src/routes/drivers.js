// Rutas CRUD de conductores: /api/conductores
// Cada ruta de obtención, creación, actualización y eliminación pasa por su
// cadena de express-validator antes de llegar al controlador.
const express = require('express');
const controller = require('../controllers/driverController');
const { validar, validarIdParam } = require('../validators/helpers');
const driverValidators = require('../validators/driverValidators');

const router = express.Router();

router.get('/', controller.listar); // listar todos
router.get('/:id', validarIdParam('id'), validar, controller.obtener); // obtener por id
router.post('/', driverValidators.crear, validar, controller.crear); // crear
router.put('/:id', validarIdParam('id'), validar, driverValidators.actualizar, validar, controller.actualizar); // actualizar
router.delete('/:id', validarIdParam('id'), validar, controller.eliminar); // eliminar

module.exports = router;
