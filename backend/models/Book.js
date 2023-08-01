const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// création d'un schéma de données qui contient les champs souhaités pour chaque 'Book', et leurs types ainsi que leurs caractères (obligatoire ou non)
const bookSchema = mongoose.Schema({
    userId : {type: String, required: true},
    title: {type: String, required: true, unique: true},
    author: {type: String, required: true},
    imageUrl: {type: String, required: true},
    year: {type: Number, required: true},
    genre: {type: String, required: true},
    ratings : 
        [
            {
            userId : {type: String, required: true},
            grade : {type: Number, required: true, min: 0, max: 5},
        }
    ],
    averageRating: {type: Number, default: 0}
});

// permet de garantir que certaines données soient uniques dans la collection MongoDB
bookSchema.plugin(uniqueValidator);

// exportation du schéma en tant que modèle Mongoose appelé 'Book', le rendant disponible pour notre application Express
module.exports = mongoose.model('Book', bookSchema);