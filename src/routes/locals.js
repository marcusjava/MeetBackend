const { Router } = require('express');

const routes = Router();

const { isAdmin } = require('../middlewares/access');

const passport = require('passport');

const LocalController = require('../controllers/LocalController');

routes.post('/', passport.authenticate('jwt', { session: false }), isAdmin, LocalController.save);
routes.put('/:id', passport.authenticate('jwt', { session: false }), isAdmin, LocalController.update);
routes.get('/:id', passport.authenticate('jwt', { session: false }), LocalController.retrieve);
routes.get('/', passport.authenticate('jwt', { session: false }), LocalController.list);

module.exports = routes;
