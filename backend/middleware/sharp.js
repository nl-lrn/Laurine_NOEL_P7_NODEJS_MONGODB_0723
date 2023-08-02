// importation de sharp
const sharp = require('sharp');
// importation du système des chemins des fichiers
const path = require('path');
const fs = require('fs');
            
// fonction pour optimiser les images
const optimizeImage = (req, res, next) => {

    // vérification s'il y a une image ou non
    if (!req.file) return next();

    // si l'image existe elle est stockée dans cette variable
    const imageInput = req.file.path;
    // permet la sortie de l'image en étant optimisée
    const imageOutput = req.file.path.replace(/\.(jpg|jpeg|png)$/, ".webp");

    sharp(imageInput)
    // permet de redimensionner les images uploader par les utilisateurs
    .resize({ width: 200 })
    // permet changement de format des images uploader par les utilisateurs
    .toFormat('webp')
    // permet de récupérer l'image optimisée
    .toFile(imageOutput)
    // s'il n'y a eu aucunes erreurs alors on peut passer au 'then'
    .then(() => {
      // Supprime l'ancienne image non optimisée
      fs.unlinkSync(imageInput);
      // mise à jour du fichier pour récupérer l'image optimisée et son changement de format
      req.file.path = imageOutput;
      req.file.mimetype = 'image/webp';
      req.file.filename = req.file.filename.replace(/\.(jpg|jpeg|png)$/, '.webp');
      // passage au prochain middleware
      next();
    })
    // permet de gérer s'il y a une erreur
    .catch((error) => {
      console.error("Erreur lors de la modification de l'image :", error);
      next();
    });
};

module.exports = optimizeImage;