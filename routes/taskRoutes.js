const express = require('express');
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/sendTask', authController.protect, taskController.sendTask);

// Restrict all routes after this middleware to admin & super admin
router.use(
  authController.protect,
  // authController.restrictTo('admin', 'superAdmin'),
);

router.route('/').get(taskController.getAllTasks);
router.route('/task-stats').get(taskController.getTaskStats);
router
  .route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
