const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/landing', viewsController.getLanding);
router.get('/welcome', viewsController.getWelcome);

router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

// router.use(authController.protect);
router.get('/me', authController.protect, viewsController.getMe);

router.get('/tasks', authController.protect, viewsController.getMyTasks);

router.get('/tasks/:id', authController.protect, viewsController.getTask);
router.get(
  '/users/:id',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getUser,
);

router.get(
  '/usersList',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getAllUsers,
);

module.exports = router;
