const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.o3atuqr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

let dbConnection;

module.exports = {
  connectToServer: async (callback) => {
    await client.connect();
    dbConnection = await client.db(process.env.DB_NAME);
    console.log("Successfully connected to MongoDB.");
    callback();
  },

  getDb: () => {
    return dbConnection;
  },
};
