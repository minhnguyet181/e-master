// src/controllers/user.controller.js
const jwt = require('jsonwebtoken');
const UserService = require('../services/user.service');
const AIService = require('../services/ai.service');
const { handleResponse, handleError } = require('./base.controller');

exports.getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserService.getProfile(decoded.id);
    handleResponse(res, user);
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserService.updateProfile(decoded.id, req.body);
    handleResponse(res, user, 'Profile updated successfully');
  } catch (err) {
    handleError(res, err);
  }
};

// Gửi thông tin học tập lên AI để tạo lộ trình
exports.generateLearningPlan = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserService.getProfile(decoded.id);

    const aiPlan = await AIService.generateLearningPlan({
      goal: user.goal,
      band_target: user.band_target,
      study_hours_per_day: user.study_hours_per_day,
      reason: user.reason,
    });

    await UserService.saveAIRecommendation(user.id, aiPlan);
    handleResponse(res, JSON.parse(aiPlan), 'AI learning plan generated');
  } catch (err) {
    handleError(res, err);
  }
};
