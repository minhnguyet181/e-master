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
    const userId = decoded.id;
    
    const user = await UserService.getProfile(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate AI learning plan
    const aiPlan = await AIService.generateLearningPlan({
      learningGoal: user.goal,
      currentBand: user.current_band,
      targetBand: user.band_target,
      dailyStudyHours: user.study_hours_per_day,
      learningPurpose: user.reason,
    });

    // Ensure aiPlan is an object (not string)
    const planObject = typeof aiPlan === 'string' ? JSON.parse(aiPlan) : aiPlan;

    // Save to database
    await UserService.saveAIRecommendation(userId, planObject);

    // Return success response
    handleResponse(res, planObject, 'AI learning plan generated and saved successfully');
  } catch (err) {
    console.error('❌ Error in generateLearningPlan:', err);
    handleError(res, err);
  }
};

/**
 * Tìm kiếm users theo band
 * GET /e-master/user/search-by-band?band=5&bandType=current&exactMatch=false&limit=20&offset=0
 */
exports.searchUsersByBand = async (req, res) => {
  try {
    const {
      band,
      bandType = 'both', // 'current', 'target', or 'both'
      exactMatch = 'false',
      limit = 50,
      offset = 0
    } = req.query;

    if (!band) {
      return res.status(400).json({
        success: false,
        error: 'Band parameter is required'
      });
    }

    const result = await UserService.searchUsersByBand(
      {
        band,
        bandType,
        exactMatch: exactMatch === 'true'
      },
      parseInt(limit),
      parseInt(offset)
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error in searchUsersByBand:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Tìm kiếm users trong khoảng band
 * GET /e-master/user/search-by-band-range?minBand=5&maxBand=6&bandType=both&limit=20&offset=0
 */
exports.searchUsersByBandRange = async (req, res) => {
  try {
    const {
      minBand,
      maxBand,
      bandType = 'both',
      limit = 50,
      offset = 0
    } = req.query;

    if (!minBand || !maxBand) {
      return res.status(400).json({
        success: false,
        error: 'minBand and maxBand parameters are required'
      });
    }

    const result = await UserService.searchUsersByBandRange(
      {
        minBand,
        maxBand,
        bandType
      },
      parseInt(limit),
      parseInt(offset)
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error in searchUsersByBandRange:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Generate learning path từ current_band đến target_band
 * POST /e-master/user/generate-learning-path
 */
exports.generateLearningPath = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const LearningPathService = require('../services/learningPath.service');
    
    const result = await LearningPathService.generateLearningPathFromBands(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('❌ Error in generateLearningPath:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get learning path của user
 * GET /e-master/user/learning-path
 */
exports.getLearningPath = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const LearningPathService = require('../services/learningPath.service');
    
    const result = await LearningPathService.getLearningPath(userId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('❌ Error in getLearningPath:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
