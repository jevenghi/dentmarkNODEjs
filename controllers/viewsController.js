const pug = require('pug');

const Task = require('../models/taskModel');
const User = require('../models/userModel');
const catchAsyncError = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

exports.getOverview = catchAsyncError(async (req, res, next) => {
  const tasks = await Task.find()
    // .populate({ path: 'user', select: 'name' })
    .sort({ createdAt: -1 });

  res.status(200).render('overview', {
    title: 'All Tasks',
    tasks,
    //   res.status(200).json({
    //     title: 'All Tasks',
    //     tasks,
  });
});

exports.getTask = catchAsyncError(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  console.log(task);

  const dentsHTML = pug.renderFile('views/dents.pug', { task });

  res.status(200).render('task', {
    title: 'Task',
    // task,
    dentsHTML: dentsHTML,
  });
});

exports.getMe = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).render('user', {
    title: 'My Profile',
    user,
  });
});

exports.getMyTasks = catchAsyncError(async (req, res, next) => {
  const tasks = await Task.find({ user: req.user.id })
    // .populate({ path: 'user', select: 'name' })
    .sort({ createdAt: -1 });

  res.status(200).render('tasks', {
    title: 'Tasks',
    tasks,
    //   res.status(200).json({
    //     title: 'All Tasks',
    //     tasks,
  });
});
