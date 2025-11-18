// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authenticate = require('./middlewares/auth.middleware');

router.get('/user/profile', authenticate, UserController.getProfile);
router.put('/user/update-profile', authenticate, UserController.updateProfile);
router.post('/user/generate-plan', authenticate, UserController.generateLearningPlan);
router.get('/user/recommended-resources', authenticate, UserController.getRecommendedResources);
router.get('/user/courses', authenticate, UserController.getUserCourses);
router.get('/user/courses/:id', authenticate, UserController.getUserCourseById);
router.get('/user/ai-recommendation', authenticate, UserController.getAIRecommendation);

module.exports = router;
