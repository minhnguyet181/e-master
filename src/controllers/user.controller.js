// src/controllers/user.controller.js
const UserService = require('../services/user.service');
const AIService = require('../services/ai.service');
const ResourceService = require('../services/resource.service');
const { getBandBucket, representativeBandForBucket } = require('../utils/studyPlanUtils');
const { handleResponse, handleError } = require('./base.controller');
const UserCourse = require('../models/userCourse.model');
const User = require('../models/user.model');
exports.getProfile = async (req, res) => {
  try {
    const decoded = req.user;
    const user = await UserService.getProfile(decoded.id);
    handleResponse(res, user);
  } catch (err) {
    handleError(res, err);
  }
};

// Get user's enrolled courses
exports.getUserCourses = async (req, res) => {
  try {
    const decoded = req.user;
    const userId = decoded.id;

    const courses = await UserCourse.findAll({ where: { user_id: userId } });
    handleResponse(res, { courses }, 'User courses retrieved');
  } catch (err) {
    handleError(res, err);
  }
};

// Get specific user course
exports.getUserCourseById = async (req, res) => {
  try {
    const decoded = req.user;
    const userId = decoded.id;
    const courseId = parseInt(req.params.id, 10);

    const course = await UserCourse.findOne({ where: { id: courseId, user_id: userId } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    handleResponse(res, { course }, 'User course retrieved');
  } catch (err) {
    handleError(res, err);
  }
};

// Return saved AI recommendation for user (if any)
exports.getAIRecommendation = async (req, res) => {
  try {
    const decoded = req.user;
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const raw = user.ai_recommendation || null;
    let parsed = null;
    if (raw) {
      try { parsed = JSON.parse(raw); } catch (e) { parsed = raw; }
    }
    handleResponse(res, { ai_recommendation: parsed }, 'AI recommendation');
  } catch (err) {
    handleError(res, err);
  }
};

// Get recommended resources based on user's band (without AI generation)
exports.getRecommendedResources = async (req, res) => {
  try {
    const decoded = req.user;
    const user = await UserService.getProfile(decoded.id);
    
    // Use user's target or current band
    const band = user.band_target || user.current_band;
    
    let resources = { success: false, resources: [] };
    try {
      if (band) {
        resources = await ResourceService.getResourcesByBand({ band }, 10, 0);
      } else {
        resources = await ResourceService.getResourcesForUser(decoded.id, { useTargetBand: true }, 10);
      }
    } catch (e) {
      console.warn('⚠️ Failed to fetch resources:', e.message);
    }

    const responsePayload = {
      success: true,
      user_band: band,
      resources: resources.resources || [],
      resources_meta: {
        total: resources.total || (resources.resources ? resources.resources.length : 0),
        filter_applied: resources.filter_applied || {}
      }
    };

    return handleResponse(res, responsePayload, 'Recommended resources retrieved');
  } catch (err) {
    console.error('❌ getRecommendedResources error:', err.message);
    handleError(res, err);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const decoded = req.user;
    const user = await UserService.updateProfile(decoded.id, req.body);
    handleResponse(res, user, 'Profile updated successfully');
  } catch (err) {
    handleError(res, err);
  }
};

// Gửi thông tin học tập lên AI để tạo lộ trình
exports.generateLearningPlan = async (req, res) => {
  try {
    const decoded = req.user;
    const user = await UserService.getProfile(decoded.id);

    let aiResult = null;
    let planObj = null;

    // Try to get AI plan, but fallback to default if AI fails
    try {
      aiResult = await AIService.generateLearningPlan(decoded.id, req.body || {});
      planObj = typeof aiResult === 'string' ? (() => {
        try { return JSON.parse(aiResult); } catch (e) { return null; }
      })() : aiResult;
    } catch (aiErr) {
      console.warn('⚠️ AI generation failed:', aiErr.message);
      // Fallback: create a basic plan structure
      planObj = {
        summary: 'Study plan generated with fallback (AI unavailable)',
        duration_weeks: 8,
        weekly_plan: [],
        recommended_materials: [],
        targetBand: user.band_target || '7.0',
        recommended_band_bucket: '5.0-7.0',
        recommended_band_value: 6.0
      };
    }

    // Determine band to use for resources
    let bandValue = null;
    if (planObj && (planObj.targetBand || planObj.target_band || planObj.band_target)) {
      bandValue = planObj.targetBand || planObj.target_band || planObj.band_target;
    }
    if (!bandValue) bandValue = user.band_target || user.current_band;

    // Normalize to number if possible
    const numericMatch = String(bandValue || '').match(/(\d+\.?\d*)/);
    const numericBand = numericMatch ? parseFloat(numericMatch[1]) : null;

    const bucket = numericBand ? getBandBucket(numericBand) : null;
    const representative = bucket ? representativeBandForBucket(bucket) : (numericBand || null);

    // Fetch resources appropriate for this representative band value
    let resources = { success: false, resources: [] };
    try {
      if (representative) {
        resources = await ResourceService.getResourcesByBand({ band: String(representative) }, 10, 0);
      } else {
        // fallback: use user's resources
        resources = await ResourceService.getResourcesForUser(decoded.id, { useTargetBand: true }, 10);
      }
    } catch (resErr) {
      console.warn('⚠️ Failed to fetch resources for study plan:', resErr.message);
      resources = { success: false, error: resErr.message, resources: [] };
    }

    // Build response
    const responsePayload = {
      success: true,
      plan: planObj || aiResult || { summary: 'Study plan (AI unavailable)' },
      band_bucket: bucket,
      representative_band: representative,
      resources: resources.resources || [],
      resources_meta: {
        total: resources.total || (resources.resources ? resources.resources.length : 0),
        filter_applied: resources.filter_applied || {}
      }
    };

    return handleResponse(res, responsePayload, 'AI learning plan generated');
  } catch (err) {
    console.error('❌ generateLearningPlan error:', err.message);
    handleError(res, err);
  }
};
