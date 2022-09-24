const fs = require('fs');
const express = require('express');
const routes = express.Router();

const dbo = require('../db/conn');

routes.route('/importRawData').get(async function (_req, res) {
  const dbConnect = dbo.getDb();
  const rawDataDir = process.cwd()+ '/rawData';

  fs.readdir(rawDataDir, function (err, files) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }

    files.forEach(function (file, index) {
      console.log(file);
    });
  });
});

module.exports = routes;
