const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.o3atuqr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

let dbConnection;

module.exports = {
  connectToServer: (callback) => {
    client.connect((err, db) => {
      if (err || !db) {
        return callback(err);
      }

      dbConnection = db.db("paddleroutes");
      
      console.log("Successfully connected to MongoDB.");

      return callback();
    });
  },

  getDb: () => {
    return dbConnection;
  },
};
