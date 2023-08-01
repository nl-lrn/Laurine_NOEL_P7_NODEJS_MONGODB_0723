// importation du modèle 'Book'
const Book = require('../models/Book');
const fs = require('fs');

// permet la création d'un nouveau livre
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    // suppression des id du livre et de l'utilisateur généré automatiquement par mongoDB
    delete bookObject._id;
    delete bookObject._userId;

    // création d'une nouvelle instance de 'Book' en utilisant le model de 'Book'
    const book = new Book({
      ...bookObject,
      // attribution d'un id à l'utilisateur
      userId: req.auth.userId,
      // 
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    // utilisation de 'save()' afin de pouvoir enregistrer un nouveau livre dans la base de données
    book.save()
      // un message pour dire que le lire a été ajouté apparait
      .then(() => res.status(201).json({ message: 'Votre livre a bien été enregistré !'}))
      // si le livre n'est pas créé alors un messsage d'erreur apparait
      .catch(error => res.status(400).json({error}));
};

// permet de mettre à jour un livre
exports.updateBook = (req, res, next) => {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body};

    delete bookObject._userId;
    // utilisation de 'findOne()' pour trouver le livre ayant le même '_id' aue le paramètre et la requête 
    Book.findOne({_id: req.params.id})
    // le 'Book' est retourné dans une Promise et envoyé au frontend
      .then((book) => {
        // si l'utilisateur n'a pas l'autorisation alors un messsage d'erreur apparait
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

// permet de supprimer un livre précis
exports.deleteBook = (req, res, next) => {
    // ajout du paramètre à prendre en compte, ici l'id du livre
    // utilisation de la méthode 'findOne()' pour récupérer le livre auquel l'id corresponds
    Book.findOne({_id: req.params.id})
      .then(book => {
        // si ce n'est pas l'utilisateur qui l'a ajouté alors il ne peut pas supprimer le livre
        if(book.userId != req.auth.userId) {
          res.status(401).json({message: "Vous n'avez pas l'autorisation requise."})
        } else {
          // sinon il peut modifier le livre
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            // utilisation de la méthode 'deleteOne' avec en paramètre l'id du livre afin de pouvoir supprimer le bon livre sélectionné
            Book.deleteOne({_id: req.params.id})
            .then(() => res.status(200).json({message: "Votre livre est supprimé."}))
            .catch(error => res.status(401).json({error}));
          });
        }
      })
      .catch(error => res.status(500).json({error}));
};

// permet de récupérer un livre précis
exports.getOneBook = (req, res, next) => {
    // ajout du paramètre à prendre en compte, ici l'id du livre
    // utilisation de la méthode 'findOne()' pour récupérer le livre auquel l'id corresponds
    Book.findOne({_id: req.params.id})
      // promise qui renvoit le livre en question et est envoyé au front end
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({error}));
};

// permet de récupérer tout les livres
exports.getAllBooks = (req, res, next) => {
  // utilisation de la méthode 'find()' de mongoose afin de récupérer tout les livres de la base de données
    Book.find()
      // promise qui renvoit tout les livres si la requête est bonne et est envoyé au front end
      .then(books => res.status(200).json(books))
      // sinon il y a un message d'error
      .catch(error => res.status(400).json({error}));
};

// route addRating qui permet à un utilisateur d'ajouter une note à livre et de faire la moyenne de toutes les notes
exports.addRating = (req, res, next) => {
  const { userId, rating } = req.body;

  //  utilisation de la méthode 'findById()' qui permet de chercher un livre en fonction de son id
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

// route bestRating permet de récupérer les 3 meilleurs livres notés
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