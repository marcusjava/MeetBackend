const { Router } = require('express');

const routes = Router();

const passport = require('passport');

const ChatController = require('../controllers/ChatController');

routes.get('/:id', passport.authenticate('jwt', { session: false }), ChatController.list);

module.exports = routes;
