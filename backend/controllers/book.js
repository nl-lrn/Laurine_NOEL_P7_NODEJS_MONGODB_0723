const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
      .then(() => res.status(201).json({ message: 'Votre livre a bien été enregistré !'}))
      .catch(error => res.status(400).json({error}));
};

exports.updateBook = (req, res, next) => {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body};

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
      .then((book) => {
        if(book.userId != req.auth.userId) {
          res.status(401).json({message: "Vous n'avez pas l'autorisation requise."})
        } else {
          Book.updateOne({_id: req.params.id}, { ...bookObject, _id: req.params.id})
            .then(() => res.status(200).json({ message: 'Votre livre a bien été modifié !'}))
            .catch(error => res.status(401).json({error}));
        }
      })
      .catch(error => res.status(400).json({error}));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
      .then(book => {
        if(book.userId != req.auth.userId) {
          res.status(401).json({message: "Vous n'avez pas l'autorisation requise."})
        } else {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Book.deleteOne({_id: req.params.id})
            .then(() => res.status(200).json({message: "Votre livre est supprimé."}))
            .catch(error => res.status(401).json({error}));
          });
        }
      })
      .catch(error => res.status(500).json({error}));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({error}));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({error}));
};

// exports.addRating = (req, res, next) => {
//   const { userId, rating } = req.body;

//   Book.findById(req.params.id)
//     .then(book => {
//       // permet de vérifier si l'utilisateur a déjà noté le livre
//       const alreadyRated = book.ratings.find(rating => rating.userId === userId);
//       if (alreadyRated) {
//         return res.status(401).json({ message: "Vous avez déjà attribué une note à ce livre." });
//       }
//       // permet d'ajouter la nouvelle notation à la liste des évaluations du livre
//       const newRating = { userId, grade: rating };
//       book.ratings.push(newRating);
//       // permet de mettre à jour le livre dans la base de données avec la nouvelle notation
//       Book.findByIdAndUpdate(req.params.id, { ratings: book.ratings }, { new: true })
//         .then(updatedBook => res.status(201).json({ message: 'Votre note a bien été enregistrée !', book: updatedBook }))
//         .catch(error => res.status(400).json({ error }));
//     })
//     .catch(error => res.status(400).json({ error }));
// };

exports.addRating = (req, res, next) => {
  const { userId, rating } = req.body;

  Book.findById(req.params.id)
    .then(book => {
      // permet de vérifier si l'utilisateur a déjà noté le livre
      const alreadyRated = book.ratings.find(rating => rating.userId === userId);
      if (alreadyRated) {
        return res.status(401).json({ message: "Vous avez déjà attribué une note à ce livre." });
      }

      // permet d'ajouter la nouvelle notation à la liste des évaluations du livre
      const newRating = { userId, grade: rating };
      book.ratings.push(newRating);

      // Calcule la nouvelle note moyenne en tenant compte de la nouvelle notation
      const allRatings = book.ratings.map(rating => rating.grade);
      const totalRatings = allRatings.reduce((sum, current) => sum + current, 0);
      const averageRating = totalRatings / book.ratings.length;
      const roundedAverageRating = Math.round(averageRating * 100) / 100; // Arrondi à deux décimales

      // Met à jour la note moyenne du livre dans l'objet book
      book.averageRating = roundedAverageRating;

      // Sauvegarde le livre mis à jour
      return book.save();
    })
    .then(updatedBook => {
      // Récupère le livre mis à jour avec les informations complètes en effectuant une deuxième requête
      return Book.findById(updatedBook._id);
    })
    .then(finalUpdatedBook => {
      // Réponse JSON avec la nouvelle note, la note moyenne mise à jour et le livre complet
      const response = {
        message: 'Votre note a bien été enregistrée !',
        newRating: { userId, grade: rating }, // Nouvelle note
        averageRating: finalUpdatedBook.averageRating, // Note moyenne mise à jour
        book: finalUpdatedBook // Livre complet mis à jour
      };

      res.status(201).json(response);
    })
    .catch(error => res.status(400).json({ error }));
};


// exports.postRating = (req, res, next) => {
//   const newRating = { ...req.body };
//   newRating.grade = newRating.rating;
//   delete newRating.rating;
//   Book.findOne({ _id: req.params.id })
//     .then((book) => {
//       const cloneBook = { ...book._doc };
//       cloneBook.ratings.push(newRating); // Ajouter la nouvelle note à la fin du tableau
//       function calcAverageGrade(arr) {
//         let avr = Math.round((arr.reduce((acc, elem) => acc + elem.grade, 0) / arr.length) * 100) / 100;
//         return avr;
//       };
//       cloneBook.averageRating = calcAverageGrade(cloneBook.ratings);
//       Book.updateOne(
//         { _id: req.params.id },
//         { ...cloneBook }
//       )
//         .then(() => {
//           res.status(200).json(cloneBook);
//         })
//         .catch((err) => {
//           res.status(401).json({ err });
//         });
//     })
//     .catch((error) => {
//       res.status(400).json({ error });
//     });
// }; 

