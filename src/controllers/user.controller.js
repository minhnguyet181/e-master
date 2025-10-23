const UserService = require('../services/user.service');
const jwt = require('jsonwebtoken');

class UserController {
  static async updateProfile(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) throw new Error('Unauthorized');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const updatedUser = await UserService.updateProfile(decoded.id, req.body);
      res.json({ message: 'Profile updated', user: updatedUser });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = UserController;
