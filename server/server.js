// Loads the configuration from config.env to process.env
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// get MongoDB driver connection
const dbo = require('./db/conn');
const sessions = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(sessions);
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.o3atuqr.mongodb.net/?retryWrites=true&w=majority`;

const PORT = process.env.PORT || 5000;
const app = express();

const store = new MongoDBStore(
  {
    uri: uri,
    databaseName: process.env.DB_NAME,
    collection: 'sessions'
  }
);

store.on('error', function(error) {
  console.log('errorhandler');
  console.log(error);
});

let sess = {
    secret: process.env.COOKIE_SECRET,
    store: store,
    saveUninitialized: false,
    resave: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 48
    }
  };

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
  sess.cookie.sameSite = 'none';
}

app.use(sessions(sess));

const whitelist = ['http://localhost:8080', 'https://nola-paddle-trails.netlify.app', 'https://www.kayakneworleans.com', 'https://www.kayakneworleans.com/'];

const corsOpts = {
  credentials: true,
  origin: whitelist
}
app.use(cors(corsOpts));
app.use(express.json());
app.use(require('./routes/routes.js'));

dbo.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
