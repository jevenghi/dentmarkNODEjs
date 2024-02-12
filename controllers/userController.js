const Task = require('../models/taskModel');
const User = require('../models/userModel');
const catchAsyncErr = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

exports.sendTask = catchAsyncErr(async (req, res, next) => {
  const newTask = await Task.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newTask },
  });
});

exports.getAllUsers = catchAsyncErr(async (req, res, next) => {
  const allUsers = await User.find();
  res.status(200).json({
    status: 'success',
    results: allUsers.length,
    data: { users: allUsers },
  });
});

exports.getUser = catchAsyncErr(async (req, res, next) => {
  const customer = await User.findById(req.params.id);
  if (!customer) {
    return next(new AppError('No customer found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { customer },
  });
});
