const Task = require('../models/taskModel');
const RequestQueryHandler = require('../utils/requestQueryHandler');
const catchAsyncErr = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

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

exports.getAllTasks = catchAsyncErr(async (req, res, next) => {
  const requestQueries = new RequestQueryHandler(Task.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tasks = await requestQueries.query;
  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

exports.getCustomer = catchAsyncErr(async (req, res, next) => {
  const customer = await Task.find({ user: req.params.id });
  if (!customer.length) {
    return next(new AppError('No customer found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { customer },
  });
});

exports.updateTask = catchAsyncErr(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    data: { task },
  });
});

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
exports.getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $match: { difficulty: { $gte: 1 } },
      },
      {
        $group: {
          _id: '$user',
          numTasks: { $sum: 1 },
          avgDifficulty: { $avg: '$difficulty' },
        },
      },
      {
        $sort: { avgDifficulty: 1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      message: { stats },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
