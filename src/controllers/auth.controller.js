const AuthService = require('../services/auth.service');
const jwt = require('jsonwebtoken');

class AuthController {
  static async signup(req, res) {
    try {
      const { username, email, password } = req.body;
      const result = await AuthService.register({ username, email, password });
      res.status(201).json({ message: 'Signup successful', ...result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      res.json({ message: 'Login successful', ...result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async googleAuth(req, res) {
    try {
      const { token } = req.body;
      const result = await AuthService.googleAuth(token);
      res.json({ message: 'Google login successful', ...result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async logout(req, res) {
    const result = await AuthService.logout();
    res.json(result);
  }

  static async me(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) throw new Error('Unauthorized');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await AuthService.getCurrentUser(decoded.id);
      res.json(user);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }
}

module.exports = AuthController;
