const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const promisify = require('es6-promisify');
const expressValidator = require('express-validator');
const main = require('./utils/index');
const helpers = require('./utils/helpers');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(expressValidator());

app.use(session({

  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ 
    mongoUrl: process.env.DATABASE,
    mongooseConnection: mongoose.connection})
}))

app.use((req, res, next) => {
  res.locals.h = helpers;
  next();
});

app.use('/', main);
module.exports = app;