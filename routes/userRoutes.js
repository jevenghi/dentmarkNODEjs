const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  userController.getAllUsers,
);
// router.get('/', userController.getAllUsers);

router.route('/:id').get(userController.getUser);

router.post('/sendTask', userController.sendTask);

module.exports = router;
