const jwt = require('jsonwebtoken');
const APIError = require('../utils/apiError');
const User = require('../models/User');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new APIError(401, 'Authentication required'));
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(new APIError(401, 'Invalid or expired token'));
  }

  const user = await User.findById(payload.sub).select('-password').lean();
  if (!user) {
    return next(new APIError(401, 'User no longer exists'));
  }

  req.user = user;
  next();
}

module.exports = { protect };
