// permet la connexion à la base de données
require('dotenv').config();
const express = require('express');

// importation des routeurs
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const path = require('path');

// importation de mongoose (package ui facilite les intéractions avec la base de données MongoDB)
const mongoose = require('mongoose');
// connection à mongoose
mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  // permet d'accéder à notre API depuis n'importe quelle origine ('*')
  res.setHeader('Access-Control-Allow-Origin', '*');
  // permet d'ajouter les headers mentionnés aux requêtes envoyées vers notre API ('Origin, X-Requested-With ...')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  // permet d'envoyer des requêtes avec les différentes méthodes metntionnées ('GET, POST, PUT, DELETE ...')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// enregistrement du système de routes (routeur) ppur chaque demandes faites vers '/api/books'
app.use('/api/books', bookRoutes);
// enregistrement du système de routes (routeur) ppur chaque demandes faites vers '/api/auth'
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;