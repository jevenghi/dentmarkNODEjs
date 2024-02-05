const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// router.param('id', adminController.checkID);

router.route('/customer/:id').get(adminController.getCustomer).patch().delete();
router.route('/tasks').get(adminController.getAllTasks).patch().delete();
router.route('/').get(adminController.getAllCustomers).patch().delete();

module.exports = router;
