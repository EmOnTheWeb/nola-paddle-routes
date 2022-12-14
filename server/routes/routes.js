const express = require('express');
const routes = express.Router();
const handlers = require('../handlers/allHandlers');

routes.route('/importRawData').get(handlers.importRawData);

routes.route('/getMapPins').get(handlers.getRouteNamesAndStartCoordinates);

routes.route('/user').post(handlers.addUser);

routes.route('/user').get(handlers.getUser);

routes.route('/signin').post(handlers.signInUser);

routes.route('/logout').post(handlers.logout);

routes.route('/comment').post(handlers.addComment);

routes.route('/comment').put(handlers.deleteComment);

routes.route('/comment').get(handlers.getComments);

routes.route('/paddles').post(handlers.addPaddle);

routes.route('/paddles').put(handlers.editPaddle);

routes.route('/paddles/:userId').get(handlers.getRouteNamesAndStartCoordinates);

// routes.route('/paddles').put(handlers.updatePaddle);

module.exports = routes;
