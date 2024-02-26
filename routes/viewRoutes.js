const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/me', authController.protect, viewsController.getOverview);
router.get('/', viewsController.getOverview);
router.get('/task/:id', viewsController.getTask);

module.exports = router;
