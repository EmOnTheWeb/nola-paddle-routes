const express = require('express');
const routes = express.Router();

const dbo = require('../db/conn');

routes.route('/importRawData').get(async function (_req, res) {
  const dbConnect = dbo.getDb();
  console.log('well this seemed to work');
});

module.exports = routes;
