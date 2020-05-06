var express = require('express');
var app = express();
var db = require('./db');
global.__root   = __dirname + '/'; 


// // Middlewares
// app.use(express.json());
// app.set("view engine", "ejs");


app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);


var ArtController = require(__root + 'artwork/ArtController');
app.use('/api/artwork', ArtController);

module.exports = app;