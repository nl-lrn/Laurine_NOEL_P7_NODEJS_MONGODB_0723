// importation de sharp
const sharp = require('sharp');
// importation du système des chemins des fichiers
const path = require('path');
const fs = require('fs');

// fonction pour optimiser les images
const optimizeImage = (req, res, next) => {
  // vérification s'il y a une image ou non
  if (!req.file) {
    return next();
  }
  // vérification des informations de l'image téléchargée
  const { filename, path: imagePath } = req.file;
  // création du chemin vers l'endroit où sera stocké la nouvelle image optimisée
  const optimizedImagePath = path.join(path.dirname(imagePath), filename);
  
  sharp(imagePath)
  // permet de redimensionner les images uploader par les utilisateurs
  .resize(200)
  // enregistrement du chemin de la nouvelle image optimisée
  .toFile(optimizedImagePath, (err, info) => {
    if (err) {
      // En cas d'erreur lors de l'optimisation de l'image
      console.error(err);
      return next();
    }
    // Supprime l'ancienne image non optimisée après avoir créé la version optimisée
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
      }
      // stockage du chemin de la nouvelle image optimisée
      req.file.path = optimizedImagePath;
      // envoie de l'image optimisée en réponse
      res.sendFile(optimizedImagePath);
      // passage au prochain middleware
      next();
      });
    });
};

module.exports = optimizeImage;