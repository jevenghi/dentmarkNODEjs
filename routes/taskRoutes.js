const express = require('express');

const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');
const imageController = require('../controllers/imageController');

const router = express.Router();

router.post(
  '/sendTask',
  authController.protect,
  imageController.transferFiles,
  taskController.sendTask,
  // remove next() to sendTask when commenting below
  taskController.sendTaskCreationEmail,
);
router.post(
  '/sendTask/:id',
  authController.protect,
  imageController.transferFiles,

  taskController.addDentsToTask,
);

// Restrict all routes after this middleware to admin & super admin
router.use(
  authController.protect,
  // authController.restrictTo('admin', 'superAdmin'),
);

router.route('/').get(taskController.getAllTasks);
router.route('/task-stats').get(taskController.getTaskStats);
router.get(
  '/generate-admin-report',
  authController.restrictTo('admin'),
  taskController.generateAdminReport,
);
router
  .route('/:id')
  .get(taskController.getTask)
  .patch(authController.restrictTo('admin'), taskController.updateDents)
  .delete(taskController.deleteTask);

module.exports = router;
