const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookControllers = require('../controllers/book');

router.get('/', auth, bookControllers.getAllBooks);
router.post('/', auth, multer, bookControllers.createBook);
router.get('/:id', auth, bookControllers.getOneBook);
router.put('/:id', auth, multer, bookControllers.updateBook);
router.delete('/:id', auth, bookControllers.deleteBook);

module.exports = router;