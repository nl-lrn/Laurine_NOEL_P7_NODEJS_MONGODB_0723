const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// création d'un schéma de données qui contient les champs souhaités pour chaque 'Book', et leur type ainsi que leur caractère (obligatoire ou non)
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
            grade : {type: Number, required: true, min: 0, max: 5, unique: true},
        }
    ],
    averageRating: {type: Number, default: 0}
});

bookSchema.plugin(uniqueValidator);

// exportation du schéma en tant que modèle Mongoose appelé 'Book', le rendant disponible pour notre application Express
module.exports = mongoose.model('Book', bookSchema);