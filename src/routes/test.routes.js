// src/routes/test.routes.js
const express = require('express');
const router = express.Router();
const TestController = require('../controllers/test.controller');
const authenticate = require('./middlewares/auth.middleware');

router.get('/', authenticate, TestController.getAll);
router.get('/type/:type', authenticate, TestController.getByType);
router.get('/:id', authenticate, TestController.getById);

module.exports = router;
