const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();

router.put('/user/profile', UserController.updateProfile);

module.exports = router;
