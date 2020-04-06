const Session = require('../models/session');

const authenticate = async (req, res, next) => {
  try {
    // get the session token from the request cookies
    const { token } = req.cookies;
    if (!token || typeof token !== 'string') {
      // if the token is not a string, we know the session token was not set by the server and is therefore invalid
      throw new Error('Request cookie is invalid.');
    }
    // query the database using the session token and checking for status of valid
    const session = await Session.findOne({ token, status: 'valid' });
    if (!session) {
      // if the a session is not found with the provided token, clear the cookie
      // e.g. user session expired on server, but the browser still has the cookie
      res.clearCookie('token');
      throw new Error('Your session has expired. You need to log in.');
    }
    // set the session retrieved from db on the request object
    // the request object will be passed on to the next() call
    req.session = session;

    // continues the request-response cycle
    next();
  } catch (err) {
    res.status(401).json({
      errors: [
        {
          title: 'Unauthorized',
          detail: 'Authentication credentials invalid',
          errorMessage: err.message,
        },
      ],
    });
  }
};

module.exports = { authenticate };