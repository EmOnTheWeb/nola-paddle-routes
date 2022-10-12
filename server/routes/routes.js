const express = require('express');
const routes = express.Router();
const handlers = require('../handlers/allHandlers');

routes.route('/importRawData').get(handlers.importRawData);

routes.route('/getMapPins').get(handlers.getRouteNamesAndStartCoordinates);

routes.route('/user').post(handlers.addUser);

routes.route('/user').get(handlers.getUser);

routes.route('/signin').post(handlers.signInUser);

module.exports = routes;
