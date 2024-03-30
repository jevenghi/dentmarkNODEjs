const express = require('express');
const imageController = require('../controllers/imageController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/uploadPhotos', authController.protect, imageController.uploadTaskPhotos, imageController.resizeTaskPhotos);
// router.post('/uploadPhotos', authController.protect, imageController.uploadTaskPhotos);

module.exports = router;
