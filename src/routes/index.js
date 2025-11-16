// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const aiRoutes = require('./ai.routes');
const testRoutes = require('./test.routes');
const submissionRoutes = require('./submission.routes');
const progressRoutes = require('./progress.routes');
const reminderRoutes = require('./reminder.routes');
const placementTestRoutes = require('./placementTest.routes');
const resourceRoutes = require('./resource.routes');
const studyRequirementRoutes = require('./studyRequirement.routes');

// Gắn prefix cho từng nhóm API
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/ai', aiRoutes);
router.use('/test', testRoutes);
router.use('/submission', submissionRoutes);
router.use('/progress', progressRoutes);
router.use('/reminder', reminderRoutes);
router.use('/', placementTestRoutes); // /e-master/placement-test/...
router.use('/', resourceRoutes); // /e-master/resources/...
router.use('/', studyRequirementRoutes); // /e-master/study-requirements/...

router.get('/', (req, res) => res.send('🌍 E-Master API Running!'));

module.exports = router;
