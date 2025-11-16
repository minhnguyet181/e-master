// src/routes/studyRequirement.routes.js
const express = require('express');
const router = express.Router();
const studyRequirementController = require('../controllers/studyRequirement.controller');
const authMiddleware = require('./middlewares/auth.middleware');

// Get study requirements for current user
router.get('/study-requirements', authMiddleware, studyRequirementController.getUserStudyRequirements);

// Calculate study requirements with custom bands
router.post('/study-requirements/calculate', studyRequirementController.calculateStudyRequirements);

module.exports = router;

