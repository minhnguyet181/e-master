// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authenticate = require('./middlewares/auth.middleware');

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.post('/generate-plan', authenticate, UserController.generateLearningPlan);

module.exports = router;
