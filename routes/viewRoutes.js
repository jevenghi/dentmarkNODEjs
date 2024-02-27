const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/me', viewsController.getMe);
router.get('/tasks', viewsController.getMyTasks);

router.get('/', viewsController.getOverview);
router.get('/tasks/:id', viewsController.getTask);

module.exports = router;
