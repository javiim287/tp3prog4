const express = require('express');
const controller = require('../controllers/userController');
const { validar } = require('../validators/helpers');
const userValidators = require('../validators/userValidators');

const router = express.Router();

router.post('/registro', userValidators.registrar, validar, controller.registrar);
router.post('/login', userValidators.iniciarSesion, validar, controller.iniciarSesion);

module.exports = router;
