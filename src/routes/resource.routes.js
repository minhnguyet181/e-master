// src/routes/resource.routes.js
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const authMiddleware = require('./middlewares/auth.middleware');

// Get resources for current user (filtered by band)
router.get('/resources', authMiddleware, resourceController.getResourcesForUser);

// Get resources by specific band (public, no auth needed)
router.get('/resources/by-band', resourceController.getResourcesByBand);

// Search resources (must be before /:id route)
router.get('/resources/search', resourceController.searchResources);

// Get resource by ID (must be last to avoid matching /search or /by-band)
router.get('/resources/:id', resourceController.getResourceById);

module.exports = router;

