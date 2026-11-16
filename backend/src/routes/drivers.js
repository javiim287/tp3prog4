const express = require('express');
const controller = require('../controllers/driverController');
const { requerirAuth } = require('../middleware/auth');
const { validar, validarIdParam } = require('../validators/helpers');
const driverValidators = require('../validators/driverValidators');

const router = express.Router();

router.use(requerirAuth);

router.get('/', controller.listar);
router.get('/:id', validarIdParam('id'), validar, controller.obtener);
router.post('/', driverValidators.crear, validar, controller.crear);
router.put('/:id', validarIdParam('id'), validar, driverValidators.actualizar, validar, controller.actualizar);
router.delete('/:id', validarIdParam('id'), validar, controller.eliminar);

module.exports = router;
