// Rutas CRUD de vehículos: /api/vehiculos
const express = require('express');
const controller = require('../controllers/vehicleController');

const router = express.Router();

router.get('/', controller.listar); // listar todos
router.get('/:id', controller.obtener); // obtener por id
router.post('/', controller.crear); // crear
router.put('/:id', controller.actualizar); // actualizar
router.delete('/:id', controller.eliminar); // eliminar

module.exports = router;
