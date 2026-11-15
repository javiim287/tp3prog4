// Rutas de usuarios: /api/usuarios
// Registro e inicio de sesión, con validación de formato de email y política
// de contraseña. La protección de rutas con JWT + Passport se agrega en el
// Módulo 5.
const express = require('express');
const controller = require('../controllers/userController');
const { validar } = require('../validators/helpers');
const userValidators = require('../validators/userValidators');

const router = express.Router();

router.post('/registro', userValidators.registrar, validar, controller.registrar); // crear cuenta
router.post('/login', userValidators.iniciarSesion, validar, controller.iniciarSesion); // iniciar sesión

module.exports = router;
