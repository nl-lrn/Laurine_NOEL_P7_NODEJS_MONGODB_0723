// routes qui permettent d'accéder aux bonnes requêtes
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const optimizeImageMiddleware = require('../middleware/sharp');

const bookControllers = require('../controllers/book');

// routes permettant soit de récupérer un livre, tout les livres, de le supprimer ou de le modifier, ou encore de le noter et de récupérer les livres les mieux notés
router.post('/', auth, multer, optimizeImageMiddleware, bookControllers.createBook);
router.get('/', bookControllers.getAllBooks);
router.get('/bestrating', bookControllers.bestRating);
router.get('/:id', bookControllers.getOneBook);
router.put('/:id', auth, multer, optimizeImageMiddleware, bookControllers.updateBook);
router.delete('/:id', auth, bookControllers.deleteBook);
router.post('/:id/rating', auth, multer, optimizeImageMiddleware, bookControllers.addRating);

module.exports = router;