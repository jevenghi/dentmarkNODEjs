const Task = require('../models/taskModel');
const User = require('../models/userModel');
const catchAsyncErr = require('../utils/catchAsyncError');

exports.sendTask = catchAsyncErr(async (req, res, next) => {
  const newTask = await Task.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newTask },
  });
});
