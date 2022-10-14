const dbo = require('../db/conn');
const fs = require('fs');
const tj = require('@mapbox/togeojson');
DOMParser = require('xmldom').DOMParser;
const formidable = require('formidable');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

async function deleteComment(req,res) {

  let userId = req.session.uid;
  let comment = req.body.comment;
  let idPaddle = req.body.idPaddle;

  const db = dbo.getDb();
  const commentsCollection = db.collection('comments');

  await commentsCollection.updateOne(
    {idPaddle: idPaddle},
    {$pull : {"comments" : {comment:comment,uid:userId}}}
  );

  res.send({success:true});
}

async function addComment(req, res) {

  let idPaddle = req.body.idPaddle;
  let userId = req.session.uid;
  let username = req.session.username;
  let comment = req.body.comment;

  const db = dbo.getDb();
  const commentsCollection = db.collection('comments');

  let thereAreCommentsForThisPaddle = await commentsCollection.findOne({idPaddle: idPaddle});

  let commentObj = {
    comment: comment,
    uid: userId,
    username: username,
    dttimestamp: new Date()
  }

  if (thereAreCommentsForThisPaddle) {
    //update existing document
    await commentsCollection.updateOne(
     { idPaddle:idPaddle },
     { $push: { comments: commentObj } }
    )
  } else {
    //insert new document
    await commentsCollection.insertOne(
      { idPaddle:idPaddle,
        comments: [ commentObj ]
      }
    );
  }

  let responseObj = {
    success: true,
    comment: commentObj
  }

  res.send(responseObj);
}

async function getComments(req, res) {

  const db = dbo.getDb();
  const commentsCollection = db.collection('comments');

  let idPaddle = req.query.idPaddle;
  let comments = await commentsCollection.findOne({idPaddle:idPaddle});
  let responseObj = {
      success:true,
      comments:(comments) ? comments.comments.reverse() : []
    };

  res.send(responseObj);
}

function logout(req, res) {
  req.session.destroy(function(err) {
    res.send({success:true});
  });
}

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

function uploadFileAndExtractRouteCoordinates(tempFilePath,destFilePath) {
  return new Promise ((resolve,reject) => {
    fs.rename(tempFilePath, destFilePath, async (err) => {

      if (err) throw err;

      console.log('file successfully uploaded');

        //now extract the route coordinates from the file
        let parts = destFilePath.split('.');
        let ext = parts[parts.length - 1];

        let fileContents = new DOMParser().parseFromString(fs.readFileSync(destFilePath, 'utf8'));
        let theGeoJson;
        if(ext === 'kml') {
          theGeoJson = tj.kml(fileContents);
        }
        if (ext === 'gpx') {
          theGeoJson = tj.gpx(fileContents);
        }

        let theRouteObj = theGeoJson.features.find((feature) => {
          return feature.geometry.type == "LineString";
        });

        resolve(theRouteObj.geometry.coordinates);
    });
  });
}


function addPaddle(req,res,next) {

  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    let tempFilePath = files.fileOne.filepath;
    const destFilePath = process.cwd()+ '/rawData' + '/' + files.fileOne.originalFilename;
    //add the file to the folder on the server

    let theCoords = await uploadFileAndExtractRouteCoordinates(tempFilePath, destFilePath);

    let tags = [fields.type].concat(fields.tags.split(','));

    let newPaddleObj = {
      name: fields.name,
      distance: fields.distance,
      launchType: fields.boatLaunchType,
      tags: tags,
      route: theCoords,
      uid: req.session.uid,
      dttimestamp: new Date()
    }

    if (files.fileTwo) {
      //this is a multi paddle
      newPaddleObj.multi = true;
    }
    //insert paddle
    const db = dbo.getDb();
    const paddlesCollection = db.collection('paddles');

    let newlyAdded = await paddlesCollection.insertOne(
      newPaddleObj
    );

    console.log('...added paddle to database');

    if (files.fileTwo) {
      //add the child paddle obj with the second route part
      let tempFilePathTwo = files.fileTwo.filepath;
      const destFilePathTwo = process.cwd()+ '/rawData' + '/' + files.fileTwo.originalFilename;
      let theCoordsTwo = await uploadFileAndExtractRouteCoordinates(tempFilePathTwo, destFilePathTwo);

      let childPaddleObj = {
        multi:true,
        idParent: newlyAdded.insertedId.toString(),
        route: theCoordsTwo,
        uid: req.session.uid,
        dttimestamp: new Date()
      }

      let newlyAddedSecondPart = await paddlesCollection.insertOne(
        childPaddleObj
      );

      console.log('...added second part of paddle to database');
    }

    res.send({success:true});
  });
}

module.exports.importRawData = importRawData;
module.exports.getRouteNamesAndStartCoordinates = getRouteNamesAndStartCoordinates;
module.exports.addUser = addUser;
module.exports.getUser = getUser;
module.exports.signInUser = signInUser;
module.exports.logout = logout;
module.exports.addComment = addComment;
module.exports.getComments = getComments;
module.exports.deleteComment = deleteComment;
module.exports.addPaddle = addPaddle;
