const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// création d'un schéma de données qui contient les champs souhaités pour chaque 'User', et leurs types ainsi que leurs caractères (obligatoire ou non)
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 5}
});

// permet de garantir que certaines données soient uniques dans la collection MongoDB
userSchema.plugin(uniqueValidator);

// exportation du schéma en tant que modèle Mongoose appelé 'User', le rendant disponible pour notre application Express
module.exports = mongoose.model('User', userSchema);