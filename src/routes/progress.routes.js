// src/routes/progress.routes.js
const express = require('express');
const router = express.Router();
const ProgressController = require('../controllers/progress.controller');
const authenticate = require('./middlewares/auth.middleware');

router.get('/', authenticate, ProgressController.getProgress);
router.put('/', authenticate, ProgressController.updateProgress);
router.post('/reset-weekly', authenticate, ProgressController.resetWeekly);

module.exports = router;
