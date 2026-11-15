// Rutas de usuarios: /api/usuarios
// Registro e inicio de sesión. La protección de rutas con JWT + Passport
// se agrega en el Módulo 5.
const express = require('express');
const controller = require('../controllers/userController');

const router = express.Router();

router.post('/registro', controller.registrar); // crear cuenta
router.post('/login', controller.iniciarSesion); // iniciar sesión

module.exports = router;
