// src/routes/placementTest.routes.js
const express = require('express');
const router = express.Router();
const placementTestController = require('../controllers/placementTest.controller');
const authMiddleware = require('./middlewares/auth.middleware');

// Submit placement test (AI sẽ phân loại band)
router.post('/placement-test/submit', authMiddleware, placementTestController.submitPlacementTest);

// Get placement test result
router.get('/placement-test/result', authMiddleware, placementTestController.getPlacementResult);

module.exports = router;

