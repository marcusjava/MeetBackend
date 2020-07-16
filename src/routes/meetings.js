const { Router } = require('express');

const routes = Router();

const passport = require('passport');

const { isAdmin } = require('../middlewares/access');

const MeetController = require('../controllers/MeetController');

routes.post('/', passport.authenticate('jwt', { session: false }), MeetController.save);
routes.put('/:id', passport.authenticate('jwt', { session: false }), MeetController.update);
routes.get('/:id', passport.authenticate('jwt', { session: false }), MeetController.retrieve);
routes.get('/', passport.authenticate('jwt', { session: false }), MeetController.list);

module.exports = routes;
