const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/').post(userController.sendTask);

module.exports = router;
