const Task = require('../models/taskModel');

exports.getAllCustomerNames = async (req, res) => {
  try {
    const customerNames = await Task.find({}).select('user');

    if (customerNames.length === 0) {
      res.status(404).json({
        status: 'fail',
        message: 'No customers found',
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: { customerNames },
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const query = Task.find(req.query);
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 1;
    const skip = (page - 1) * limit;

    query.skip(skip).limit(limit);
    const allTasks = await query;
    res.status(200).json({
      status: 'success',
      data: { allTasks },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Task.find({ user: req.params.id });
    if (customer.length) {
      res.status(200).json({
        status: 'success',
        data: { customer },
      });
    } else {
      res.status(404).json({
        status: 'fail',
        message: 'No customer found for the specified ID',
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      message: 'Task succesfully deleted',
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
