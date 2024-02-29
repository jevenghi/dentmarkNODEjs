const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/landing', viewsController.getLanding);
router.get('/welcome', viewsController.getWelcome);

router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

router.get('/me', authController.protect, viewsController.getMe);

router.get('/tasks', authController.protect, viewsController.getMyTasks);

router.get('/', viewsController.getOverview);
router.get('/tasks/:id', viewsController.getTask);

module.exports = router;
