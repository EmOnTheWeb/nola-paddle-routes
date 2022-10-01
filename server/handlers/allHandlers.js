const dbo = require('../db/conn');
const fs = require('fs');
const tj = require('@mapbox/togeojson');
DOMParser = require('xmldom').DOMParser;

async function getRouteNamesAndStartCoordinates(req,res) {

  const db = dbo.getDb();
  const paddlesCollection = db.collection('paddles');
  let array = await paddlesCollection.find({}).sort({'name':1}).toArray();

  let routeNamesAndStartCoordinates = [];

  let length = array.length;
  let multiPaddleDocs = [];
  for (let i = 0; i < length; i++) {
    let doc = array[i];
    if (doc.multi && doc.idParent) {
      multiPaddleDocs.push({
        'id':doc._id.toString(),
        'route':doc.route,
        'idParent':doc.idParent
      });
    } else {
      let startCoord = doc.route[0];
      routeNamesAndStartCoordinates.push(
        {
          'id':doc._id.toString(),
          'name':doc.name,
          'pin':startCoord,
          'route':doc.route
        }
      );
    }
  }

  function findAndConcatChildRoute(topLevelDoc, parent = null) {
    let child = multiPaddleDocs.find((doc) => doc.idParent == parent.id.toString());
    if (!child) {
      return;
    }
    topLevelDoc.route = topLevelDoc.route.concat(child.route);
    findAndConcatChildRoute(topLevelDoc,child);
  }

  if (multiPaddleDocs.length) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].multi && !array[i].idParent) {
        //get corresponding in routeNamesAndStartCoordinates
        let parentPaddleIndex = routeNamesAndStartCoordinates.findIndex((p) => p.id.toString() === array[i]._id.toString());
        let topLevelDoc = routeNamesAndStartCoordinates[parentPaddleIndex];
        findAndConcatChildRoute(topLevelDoc,topLevelDoc);
      }
    }
  }

  res.send(JSON.stringify(routeNamesAndStartCoordinates));
}

function importRawData(req,res) {

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

      if (ext === 'gpx') {
        let filePath = rawDataDir + '/' + file;
        let theGpx = new DOMParser().parseFromString(fs.readFileSync(filePath, 'utf8'));
        //seems like the first <name> tag holds the route name
        routeName = theGpx.getElementsByTagName("name")[0].childNodes[0].nodeValue;
        let theGeoJson = tj.gpx(theGpx);
        let theRouteObj = theGeoJson.features.find((feature) => {
          return feature.geometry.type == "LineString";
        });
        theCoords = theRouteObj.geometry.coordinates;
      }

      let count = await paddlesCollection.countDocuments({ name: routeName })

      if (count === 0) {

        let paddle = {
          // name: routeName,
          route: theCoords
        };

        await paddlesCollection.insertOne(
          paddle
        );

      }
    });
  });
}

module.exports.importRawData = importRawData;
module.exports.getRouteNamesAndStartCoordinates = getRouteNamesAndStartCoordinates;
