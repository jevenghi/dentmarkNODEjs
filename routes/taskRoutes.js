const express = require('express');
const adminController = require('../controllers/taskController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use('/', authController.protect, authController.restrictTo('admin'));

router.route('/task-stats').get(adminController.getTaskStats);
router.route('/').get(adminController.getAllTasks);

router
  .route('/customers')
  .get(adminController.getAllCustomerNames)
  .patch()
  .delete();
router
  .route('/tasks/:id')
  .patch(adminController.updateTask)
  .delete(adminController.deleteTask);

module.exports = router;
