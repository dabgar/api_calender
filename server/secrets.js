const secrets = {
  dbUri: process.env.DB_URI ||  'mongodb://'+process.env.MONGODB+':'+process.env.MONGO_Port+'/',
};

const getSecret = (key) => secrets[key];

module.exports = { getSecret };

const { getSecret } = require('./secrets');

mongoose
  .connect(
    getSecret('dbUri'),
    { useNewUrlParser: true
  )
  .then(
    () => {
      console.log('Connected to mongoDB');
    },
    (err) => console.log('Error connecting to mongoDB', err)
  );