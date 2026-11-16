const express = require('express');
const controller = require('../controllers/vehicleController');
const { requerirAuth } = require('../middleware/auth');
const { validar, validarIdParam } = require('../validators/helpers');
const vehicleValidators = require('../validators/vehicleValidators');

const router = express.Router();

router.use(requerirAuth);

router.get('/', controller.listar);
router.get('/:id', validarIdParam('id'), validar, controller.obtener);
router.post('/', vehicleValidators.crear, validar, controller.crear);
router.put('/:id', validarIdParam('id'), validar, vehicleValidators.actualizar, validar, controller.actualizar);
router.delete('/:id', validarIdParam('id'), validar, controller.eliminar);

module.exports = router;
