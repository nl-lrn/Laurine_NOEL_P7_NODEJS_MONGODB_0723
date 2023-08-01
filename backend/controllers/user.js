// permet de crypter le mot de passe de l'utilisateur dans la base de données
const bcrypt = require('bcrypt');
// permet de vérifier si la paire mot de posse/mail correspont à ce qui est présent dans la base de données
const jwt = require('jsonwebtoken');

// importation du modèle 'User'
const User = require('../models/User');

// permet la création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    // cryptage du mot de passe à l'aide de brcrypt
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            // création d'un nouveau utilisateur avec le mot de passe crypter
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // enregistrement de l'utilisateur dans la base de donnée
            user.save()
                .then(() => res.status(201).json({message : "L'utilisateur a bien été créé." }))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

// permet la connexion d'un utilisateur enregistré dans la base de données
exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            // si le mot de passe ou le mail ne corresponds pas alors il y a un message d'alerte
            if (!user) {
                res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte.'});
            } else {
                // sinon on compare le mot de passe rentré par l'utilisateur et celui qui a été enregistré dans la base de données
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        // s'il ne correspond pas alors il y a un message d'alerte
                        if (!valid) {
                            res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte.'})
                        } else {
                            // sinon l'utilisateur peut se connecter
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    'RANDOM_TOKEN_SECRET',
                                    { expiresIn: '24h'}
                                )
                            });
                        }
                    })
                    .catch(error => res.status(500).json({error}));
            }
        })
        .catch(error => res.status(500).json({error}));
};