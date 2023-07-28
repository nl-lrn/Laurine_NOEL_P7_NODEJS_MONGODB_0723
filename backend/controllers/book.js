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
      book.save()
      .then(() => {
        // Renvoi du livre mis à jour dans la réponse
        res.status(200).json(book);
      })
    })
    .catch(error => res.status(400).json({ error }));
};

// fonction bestRating, afin de récupérer les 3 meilleurs livres notés
exports.bestRating = (req, res, next) => {
  // on utilise la méthode find() de Mongoose qui récupère tout les livres présents dans la collection
  Book.find()
    // permet de trier les livres en fonction de leurs notes de façon décroissante 
    .sort({averageRating: -1})
    // permet de limiter le nombre de livres à 3
    .limit(3)
    // reponse de la requête qui renvoit les 3 livres les mieux notés
    .then(bestRatedBook => res.status(200).json(bestRatedBook))
    // renvoit une erreur s'il y a un problème
    .catch(error => res.status(400).json({error}))
};