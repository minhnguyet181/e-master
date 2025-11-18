// src/services/user.service.js
const User = require('../models/user.model');
const AiService = require('./ai.service');

async function getById(id) {
  return User.findByPk(id);
}

async function getProfile(userId) {
  return User.findByPk(userId);
}

async function updateProfile(userId, payload) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const allowed = ['username', 'goal', 'band_target', 'current_band', 'study_hours_per_day', 'reason', 'ai_recommendation'];
  const updates = {};
  allowed.forEach(k => { if (payload[k] !== undefined) updates[k] = payload[k]; });

  await user.update(updates);
  return user.reload();
}

async function submitLearningGoalGenerateAI(userId, input) {
  // input: { learningGoal, currentBand, targetBand, dailyStudyHours, learningPurpose }
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const aiResult = await AiService.generateLearningPlan({
    learningGoal: input.learningGoal || input.goal || user.goal,
    currentBand: input.currentBand || null,
    targetBand: input.targetBand || input.band_target || user.band_target,
    dailyStudyHours: input.dailyStudyHours || input.study_hours_per_day || user.study_hours_per_day,
    learningPurpose: input.learningPurpose || input.reason || user.reason
  });

  // Save stringified JSON for record
  await user.update({ ai_recommendation: typeof aiResult === 'string' ? aiResult : JSON.stringify(aiResult) });

  return aiResult;
}

async function saveAIRecommendation(userId, aiPlan) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');
  
  const recommendation = typeof aiPlan === 'string' ? aiPlan : JSON.stringify(aiPlan);
  await user.update({ ai_recommendation: recommendation });
  return user.reload();
}

module.exports = {
  getById,
  getProfile,
  updateProfile,
  submitLearningGoalGenerateAI,
  saveAIRecommendation
};
