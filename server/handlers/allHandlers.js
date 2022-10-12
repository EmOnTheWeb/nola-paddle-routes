const dbo = require('../db/conn');
const fs = require('fs');
const tj = require('@mapbox/togeojson');
DOMParser = require('xmldom').DOMParser;
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function signInUser(req,res) {

  let {email, password} = req.body;
  email = email.toLowerCase();
  password = password.toLowerCase();

  const db = dbo.getDb();
  const usersCollection = db.collection('users');
  let errors = [];
  let user = await usersCollection.findOne({email:email});

  if (!user) {
    errors.push('There is no account with this email address');
    res.send({
      success: false,
      errors: errors
    });
  } else {
    let hash = user.password;
    //validate password
    bcrypt.compare(password, hash, function(err, result) {
      if(result) {
        req.session.loggedIn = true;
        req.session.username = user.username;
        let userId = user._id.toString();
        req.session.uid = userId;
        res.send({
          success: true,
          loggedIn: true,
          uid: userId,
          username: user.username
        });
      } else {
        errors.push('Password did not match');
        res.send({
          success: false,
          errors: errors
        });
      }
    });
  }
}

async function getUser(req,res) {
  const sessionData = req.session;

  let isLoggedIn;
  if (sessionData.loggedIn) {
    isLoggedIn = true;
  } else {
    isLoggedIn = false;
  }

  let responseObj = {};
  responseObj.loggedIn = isLoggedIn;
  if (sessionData.username) {
    responseObj.username = sessionData.username;
  }
  responseObj.uid = sessionData.uid;
  res.send(responseObj);
}

async function addUser(req,res) {

  let {username, email, password} = req.body;
  email = email.toLowerCase();
  password = password.toLowerCase();
  const db = dbo.getDb();
  const usersCollection = db.collection('users');
  let errors = [];
  let usernameExists = await usersCollection.findOne({username:username});

  if (usernameExists) {
    errors.push('This username is taken');
  }

  let emailExists = await usersCollection.findOne({email:email});
  if (emailExists) {
    errors.push('This email already exists');
  }

  if (errors.length) {
    res.send({
      success: false,
      errors: errors
    });
  } else {
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      let newUser = await usersCollection.insertOne(
        {
          'username':username,
          'email':email,
          'password':hash
        }
      );
      req.session.loggedIn = true;
      req.session.username = username;
      req.session.uid = newUser.insertedId.toString();

      res.send({
        success: true,
        loggedIn: true,
        uid: req.session.uid,
        username: username
      });
    });
  }
}

async function getRouteNamesAndStartCoordinates(req,res) {
  const db = dbo.getDb();
  const paddlesCollection = db.collection('paddles');
  let array = await paddlesCollection.find({}).sort({'name':1}).toArray();

  let childRoutes = array.filter((d) => d.multi && d.idParent)
                         .map((d) => {
                            let childDocToObj = {
                                'id':d._id.toString(),
                                'route':d.route,
                                'idParent':d.idParent,
                                'tags':d.tags,
                                'description':d.description
                                };
                            return childDocToObj;
                         });

   function findAndConcatChildRoute(topLevelRouteObj, parent = null) {
     let child = childRoutes.find((doc) => doc.idParent == parent.id.toString());
     if (!child) {
       return;
     }
     topLevelRouteObj.route = topLevelRouteObj.route.concat(child.route);
     findAndConcatChildRoute(topLevelRouteObj,child);
   }

  let routeNamesAndStartCoordinates = [];
  let length = array.length;
  for (let i = 0; i < length; i++) {
    let doc = array[i];
    if (doc.multi && doc.idParent) {
      //these are in the childRoutes array
    } else {
      let startCoord = doc.route[0];
      let coordObj = {
          'id':doc._id.toString(),
          'name':doc.name,
          'distance':doc.distance,
          'pin':startCoord,
          'route':doc.route,
          'tags':doc.tags,
          'description':doc.description
        }

      if (doc.multi) {
        //this is top level of a multi route
        findAndConcatChildRoute(coordObj,coordObj);
      }
      routeNamesAndStartCoordinates.push(
        coordObj
      );
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
module.exports.addUser = addUser;
module.exports.getUser = getUser;
module.exports.signInUser = signInUser;
