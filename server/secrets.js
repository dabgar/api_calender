const secrets = {
  dbUri: process.env.DB_URI ||  'mongodb://test:test@ds213338.mlab.com:13338/heroku_b7btth5q/test',
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