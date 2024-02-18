const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

/**
 * Express router setup for user authentication and management endpoints.
 *
 * This router handles various user-related operations such as registration, login,
 * password reset, updating password, retrieving user information, updating user profile,
 * deleting user account, and managing user roles (for admin and superAdmin).
 * Routes are protected using authentication middleware to ensure only logged-in users
 * can access certain endpoints. Additionally, role-based access control is implemented
 * to restrict certain operations to admin and superAdmin users only.
 */
const router = express.Router({ mergeParams: true });

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

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
