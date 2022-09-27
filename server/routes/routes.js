const express = require('express');
const routes = express.Router();
const handlers = require('../handlers/allHandlers');

routes.route('/importRawData').get(handlers.importRawData);

module.exports = routes;
