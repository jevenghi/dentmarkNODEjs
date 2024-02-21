const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.get(
  '/checkAuth',
  authController.isLoggedIn,
  authController.sendAuthStatus,
);
router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/confirmEmail/:id', authController.confirmEmail);

// Restrict all routes to logged-in users after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.get(
  '/',
  authController.restrictTo('admin', 'superAdmin'),
  userController.getAllUsers,
);

router
  .route('/:id')
  .get(authController.restrictTo('admin', 'superAdmin'), userController.getUser)
  .patch(authController.restrictTo('superAdmin'), userController.updateUser);

module.exports = router;
