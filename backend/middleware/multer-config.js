// importation de multer
const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    // permet d'indiquer à multer dans quel dossier enregistrer les images uploader
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    // indique à multer d'utiliser le nom d'origine des images uploader et d'ajouter la date
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({storage}).single('image');