const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookControllers = require('../controllers/book');

router.get('/', bookControllers.getAllBooks);
router.get('/:id', bookControllers.getOneBook);
// router.get('/bestrating', bookControllers.bestRating);
router.post('/', auth, multer, bookControllers.createBook);
router.put('/:id', auth, multer, bookControllers.updateBook);
router.delete('/:id', auth, bookControllers.deleteBook);

module.exports = router;