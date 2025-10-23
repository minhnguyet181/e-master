const User = require('../models/user.model');

class UserService {
  static async updateProfile(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.update(data);
    return user;
  }
}

module.exports = UserService;
