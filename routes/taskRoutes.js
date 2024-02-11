const express = require('express');
const adminController = require('../controllers/taskController');

const router = express.Router();

// router.param('id', adminController.checkID);

router.route('/task-stats').get(adminController.getTaskStats);
router.route('/customer/:id').get(adminController.getCustomer).patch().delete();
router.route('/').get(adminController.getAllTasks).patch().delete();
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
