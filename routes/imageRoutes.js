const express = require('express');
const imageController = require('../controllers/imageController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/uploadPhotos',
  authController.isLoggedIn,
  imageController.ensureUploadUser,
  imageController.uploadTaskPhotos,
  imageController.resizeTaskPhotos,
);

router.post(
  '/uploadGuestPhotos',
  imageController.setGuestUploadUser,
  imageController.uploadTaskPhotos,
  imageController.resizeTaskPhotos,
);
router.post(
  '/transferPhotos',
  authController.protect,
  imageController.transferFiles,
);

router.post(
  '/getDataURI',
  authController.protect,
  imageController.getImageDataURI,
);
module.exports = router;
