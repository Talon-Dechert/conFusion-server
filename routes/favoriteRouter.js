/* eslint-disable no-else-return */
/* eslint-disable no-console */
/* eslint-disable arrow-parens */
/* eslint-disable no-underscore-dangle */
/* eslint-disable linebreak-style */
const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route('/')
  .get(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    console.log('Finding a favorite');
    Favorites.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (favorite) {
            console.log('Favorites exist ', req.body.length);
            for (let i = 0; i < req.body.length; i++) {
              if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                favorite.dishes.push(req.body[i]._id);
              }
            }
            favorite.save().then(
              favorite => {
                console.log('Favorite added ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              },
              err => next(err)
            );
          } else {
            Favorites.create({
              user: req.user._id,
              dishes: req.body
            }).then(
              favorite => {
                console.log('Added favorite ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              },
              err => next(err)
            );
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on Favorites.');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then(
        favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

favoriteRouter
  .route('/:dishId')
  .get(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorites => {
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ exists: false, favorites: favorites });
          } else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.json({ exists: true, favorites: favorites });
            } else {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites) {
          if (favorites.dishes.indexOf(req.params.dishId) === -1) {
            favorites.dishes.push(req.params.dishId);
            favorites
              .save()
              .then(resp => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
              })
              .catch(err => next(err));
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
          }
        } else {
          favorite = new Favorites({ user: req.user._id });
          favorite.dishes = [];
          favorite.dishes.push(req.params.dishId);
          favorite
            .save()
            .then(resp => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(resp);
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on Favorites');
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites) {
          let index = favorites.dishes.indexOf(req.params.dishId);
          if (index >= 0) {
            favorites.dishes.splice(index, 1);
          }
          favorites
            .save()
            .then(favorite => {
              Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then(favorite => {
                  console.log(favorite + ' deleted from favorites');
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                });
            })
            .catch(err => next(err));
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }
      })
      .catch(err => next(err));
  });

module.exports = favoriteRouter;
