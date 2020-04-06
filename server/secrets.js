const secrets = {
  dbUri: process.env.DB_URI ||  'mongodb://heroku_b7btth5q:5pe2mhl4ltobdl4mqahut27v3d@ds213338.mlab.com:13338/heroku_b7btth5q',
};

const getSecret = (key) => secrets[key];

module.exports = { getSecret };

const { getSecret } = require('./secrets');

mongoose
  .connect(
    getSecret('dbUri'),
    { useNewUrlParser: true
    }
  )
  .then(
    () => {
      console.log('Connected to mongoDB');
    },
    (err) => console.log('Error connecting to mongoDB', err)
  );