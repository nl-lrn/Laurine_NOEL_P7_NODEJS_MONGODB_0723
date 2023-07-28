// const sharp = require('sharp');

// sharp("file.jpg")
//     .webp()
//     .toFile("new-file.webp")
//     .then(function(info) {
//         console.log(info)
//     })
//     .catch(function(err) {
//         console.log(err)
//     });

// module.exports = sharp();

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const optimizeImage = (req, res, next) => {
  if (!req.file) {
    return next(); // Pas d'image à traiter, passe au middleware suivant.
  }

  const { filename, path: imagePath } = req.file;
  const optimizedImagePath = path.join(path.dirname(imagePath), 'optimized', filename);

  sharp(imagePath)
    .resize(800) // Redimensionne l'image à une largeur de 800 pixels (vous pouvez ajuster cette valeur selon vos besoins).
    .toFile(optimizedImagePath, (err, info) => {
      if (err) {
        // En cas d'erreur lors de l'optimisation de l'image, appelez next() pour poursuivre le flux de traitement.
        console.error(err);
        return next();
      }

      // Supprimez l'ancienne image non optimisée après avoir créé la version optimisée.
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(err);
        }
        req.file.path = optimizedImagePath; // Mettez à jour le chemin de l'image dans la requête avec le chemin de l'image optimisée.
        next();
      });
    });
};

module.exports = optimizeImage;