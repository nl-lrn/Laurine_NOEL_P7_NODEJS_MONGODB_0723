const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookControllers = require('../controllers/book');

router.post('/', auth, multer, bookControllers.createBook);
router.get('/', bookControllers.getAllBooks);
router.get('/bestrating', bookControllers.bestRating);
router.get('/:id', bookControllers.getOneBook);
router.put('/:id', auth, multer, bookControllers.updateBook);
router.delete('/:id', auth, bookControllers.deleteBook);
router.post('/:id/rating', auth, multer, bookControllers.addRating);

module.exports = router;