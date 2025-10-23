const express = require('express');
const AuthController = require('../controllers/auth.controller');
const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/google-auth', AuthController.googleAuth);
router.post('/logout', AuthController.logout);
router.get('/auth/me', AuthController.me);

module.exports = router;
