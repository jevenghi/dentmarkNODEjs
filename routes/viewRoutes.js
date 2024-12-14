const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/landing', viewsController.getLanding);
router.get('/welcome', viewsController.getWelcome);
router.get('/help', authController.protect, viewsController.getHelp);
router.get('/', authController.protect, viewsController.getMain);

router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);
router.get('/forgot-password', viewsController.getForgotPassForm);
router.get('/reset-password', viewsController.getPassResetForm);

// router.use(authController.protect);
router.get('/me', authController.protect, viewsController.getMe);

router.get('/tasks', authController.protect, viewsController.getMyTasks);

router.get('/tasks/:id', authController.protect, viewsController.getTask);

router.get(
  '/usersList',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getAllUsers,
);

router.get(
  '/invoices',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getInvoices,
);

module.exports = router;
