// importation de 'jsonwebtoken'
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // utilisation d'un try and catch en cas d'erreurs
    try {
        const token = req.headers.authorization.split(' ')[1];
        // utilisation de verify pour savoir si le token est valide sinon erreur
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        // extraction de l'id utilisateur du token 
        const userId = decodedToken.userId;
        // stockage de l'id dans la requête
        req.auth = {
            userId: userId
        };
    next();
    // si il y a un problème un message d'erreur
    } catch(error) {
        res.status(401).json({error});
    }
};