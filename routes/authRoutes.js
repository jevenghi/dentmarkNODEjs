const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.get('/checkAuth', authController.isLoggedIn, authController.sendAuthStatus);

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/checkEmail', authController.checkEmail);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword', authController.resetPassword);
router.get('/confirmEmail/:token', authController.confirmEmail);
router.get('/isAdmin', authController.isAdmin);

module.exports = router;
