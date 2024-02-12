const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  userController.getAllUsers,
);
// router.get('/', userController.getAllUsers);

router.route('/:id').get(userController.getUser);

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/sendTask', userController.sendTask);

module.exports = router;
