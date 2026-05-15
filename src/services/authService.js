const jwt = require('jsonwebtoken');
const APIError = require('../utils/apiError');
const { validateRegisterPayload, validateLoginPayload } = require('../validators/authValidator');

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

async function register(payload, { UserModel }) {
  const validation = validateRegisterPayload(payload);
  if (!validation.valid) {
    throw new APIError(422, 'Validation failed', validation.errors);
  }

  const { username, email, password } = validation.normalized;

  const existing = await UserModel.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? 'email' : 'username';
    throw new APIError(409, `This ${field} is already registered`);
  }

  const user = await UserModel.create({ username, email, password });
  const token = signToken(user._id.toString());
  return { token, user: { id: user._id, username: user.username, email: user.email } };
}

async function login(payload, { UserModel }) {
  const validation = validateLoginPayload(payload);
  if (!validation.valid) {
    throw new APIError(422, 'Validation failed', validation.errors);
  }

  const { email, password } = validation.normalized;
  const user = await UserModel.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new APIError(401, 'Invalid email or password');
  }

  const token = signToken(user._id.toString());
  return { token, user: { id: user._id, username: user.username, email: user.email } };
}

module.exports = { register, login };
