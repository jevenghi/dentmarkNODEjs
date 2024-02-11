const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/sendTask', userController.sendTask);

module.exports = router;
