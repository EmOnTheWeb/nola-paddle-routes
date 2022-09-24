const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.o3atuqr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  console.log('i connected yeah');
  client.close();
});


//
//[longitude, latitude, elevation]

//collection paddles
// {
//   // id: 1,
//   // name: 'Bay St. Louis Loop',
//   // start: {lat: 30.2988043,  lng: -89.4077829},
//   // tags: [
//   //   'Mississipi',
//   //   'Medium',
//   //   'Open water'
//   // ]
// },


//



//
//[longitude, latitude, elevation]

//collection paddles
// {
//   // id: 1,
//   // name: 'Bay St. Louis Loop',
//   // start: {lat: 30.2988043,  lng: -89.4077829},
//   // tags: [
//   //   'Mississipi',
//   //   'Medium',
//   //   'Open water'
//   // ]
// },


//
