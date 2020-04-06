const express = require('express');
const bcrypt = require('bcryptjs');
const Session = require('../models/session');

const User = require('../models/user');

const router = express.Router();




const initSession = async (userId) => {
  const token = await Session.generateToken();
  const session = new Session({ token, userId });
  await session.save();
  return session;
};

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email)) {
      throw new Error('Email must be a valid email address.');
    }
    if (typeof password !== 'string') {
      throw new Error('Password must be a string.');
    }
    const user = new User({ email, password });
    const persistedUser = await user.save();

    // we'll use the ID of the new user for new session
    const userId = persistedUser._id;
    const session = await initSession(userId);

    res
      .cookie('token', session.token, {
        httpOnly: false,
        sameSite: false,
        maxAge: 1209600000, // 2 weeks
        secure: process.env.NODE_ENV === 'production', // will only be set to true in production
      })
      .status(201)
      .json({
        title: 'User Registration Successful',
        detail: 'Successfully registered new user',
      });
  } catch (err) {
    //error handling here
  }
});
const isEmail = (email) => {
	
  if (typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

  return emailRegex.test(email);
};
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email)) {
      return res.status(400).json({
        errors: [
          {
            title: 'Bad Request',
            detail: 'Email must be a valid email address',
          },
        ],
      });
    }
    if (typeof password !== 'string') {
      return res.status(400).json({
        errors: [
          {
            title: 'Bad Request',
            detail: 'Password must be a string',
          },
        ],
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error();
    }
    // use the ID of the user who logged in for the session
    const userId = user._id;

    const passwordValidated = await bcrypt.compare(password, user.password);
    if (!passwordValidated) {
      throw new Error();
    }
    // initialize session
    const session = await initSession(userId);

    // same options as before!
    res
      .cookie('token', session.token, {
        httpOnly: false,
        sameSite: false,
        maxAge: 1209600000,
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        title: 'Login Successful',
        detail: 'Successfully validated user credentials',
      });
  } catch (err) {
    // error handling here
  }
}
);
// import authenticate middleware
const { authenticate } = require('../middleware/authenticate');

router.get('/me', authenticate, async (req, res) => {
  try {
    // using object destructuring to grab the userId from the request session
    const { userId } = req.session;

    // only retrieve the authenticated user's email
    const user = await User.findById({ _id: userId }, { email: 1, _id: 0 });

    res.json({
      title: 'Authentication successful',
      detail: 'Successfully authenticated user',
      user,
    });
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Unauthorized',
          detail: 'Not authorized to access this route',
          errorMessage: err.message,
        },
      ],
    });
  }
});
module.exports = router;
