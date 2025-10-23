const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  static async register({ username, email, password }) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new Error('Email already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return { user, token };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid password');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return { user, token };
  }

  static async googleAuth(idToken) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ where: { email: payload.email } });

    if (!user) {
      user = await User.create({
        username: payload.name,
        email: payload.email,
        googleId: payload.sub,
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return { user, token };
  }

  static async logout() {
    return { message: 'Logged out successfully' };
  }

  static async getCurrentUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    return user;
  }
}

module.exports = AuthService;
