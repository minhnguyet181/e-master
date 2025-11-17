// src/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const TokenBlocklist = require('../models/tokenBlocklist.model');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

async function register({ username, email, password }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashed });
  const token = signToken(user);
  return { user, token };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  if (!user.password) throw new Error('Account registered without password. Use Google login.');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');

  const token = signToken(user);
  return { user, token };
}

async function googleLogin({ googleId, email, username }) {
  let user = await User.findOne({ where: { googleId } });
  if (!user) {
    user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ username, email, googleId, password: null });
    } else {
      await user.update({ googleId });
    }
  }
  const token = signToken(user);
  return { user, token };
}

async function logout(token) {
  if (!token) throw new Error('No token provided');
  await TokenBlocklist.create({ token });
  return true;
}

async function isBlacklisted(token) {
  if (!token) return false;
  const found = await TokenBlocklist.findOne({ where: { token } });
  return !!found;
}

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  signToken,
  isBlacklisted,
};
