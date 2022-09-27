const dbo = require('../db/conn');
const fs = require('fs');
const tj = require('@mapbox/togeojson');
DOMParser = require('xmldom').DOMParser;

module.exports = {
  importRawData: function (_req, res) {

    const db = dbo.getDb();
    const paddlesCollection = db.collection('paddles');
    const rawDataDir = process.cwd()+ '/rawData';

    fs.readdir(rawDataDir, function (err, files) {

      if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
      }

      files.forEach(async function (file, index) {
        let ext = file.split('.').pop();

        let theCoords;
        let routeName;
        //if importing a kml file ...
        if (ext === 'kml') {
          let filePath = rawDataDir + '/' + file;
          let theKML = new DOMParser().parseFromString(fs.readFileSync(filePath, 'utf8'));
          //seems like the first <name> tag holds the route name
          routeName = theKML.getElementsByTagName("name")[0].childNodes[0].nodeValue;
          let theGeoJson = tj.kml(theKML);
          let theRouteObj = theGeoJson.features.find((feature) => {
            return feature.geometry.type == "LineString";
          });
          theCoords = theRouteObj.geometry.coordinates;
        }

        let count = paddlesCollection.countDocuments({ name: routeName })

        if (count === 0) {

          let paddle = {
            name: routeName,
            route: theCoords
          };

          await paddlesCollection.insertOne(
            paddle
          );
        }
      });
    });
  }
}
