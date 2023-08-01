const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/user');

// routes permettant d'accèder soit à la connexion soit à l'inscription
router.post('/signup', userControllers.signup);
router.post('/login', userControllers.login);

module.exports = router;
