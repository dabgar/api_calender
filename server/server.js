const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const usersRoute = require('./routes/users');
const bookRoute=require('./routes/book');
const dotenv = require('dotenv');

dotenv.config({ silent: true });
mongoose.Promise = global.Promise;
mongoose
  .connect(
    'mongodb://root:root@ds213338.mlab.com:13338/heroku_b7btth5q',
    { useNewUrlParser: true
	})
  .then(
    () => {
      console.log('Connected to mongoDB');
    },
    (err) => console.log('Error connecting to mongoDB', err)
  );

const app = express();
const port = process.env.PORT || 3000;

//sets up the middleware for parsing the bodies and cookies off of the requests
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/users', usersRoute);
app.use('/api/users',bookRoute);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app };