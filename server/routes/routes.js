const express = require('express');
const routes = express.Router();
const handlers = require('../handlers/allHandlers');

routes.route('/importRawData').get(handlers.importRawData);

routes.route('/getMapPins').get(handlers.getRouteNamesAndStartCoordinates);

module.exports = routes;
