const EventEmitter = require('events');
const AppError = require('../utils/appError');

EventEmitter.defaultMaxListeners = 15;

let Client = require('ssh2-sftp-client');
const path = require('path');

const { RESULTS_LIMIT } = require('../constants/queryConstants');
const RequestQueryHandler = require('../utils/requestQueryHandler');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const catchAsyncError = require('../utils/catchAsyncError');
const factory = require('./handlerFactory');

// const { showAlert } = require('../public/js/alerts');

exports.getHelp = catchAsyncError(async (req, res, next) => {
  const { language } = req.user;

  res.status(200).render(`help`, {
    title: 'Instruction',
    language,
  });
});

exports.getMain = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  res.status(200).render('main', {
    title: 'Dentmarker',
    role,
  });
});
exports.getPassResetForm = catchAsyncError(async (req, res, next) => {
  res.status(200).render('resetPassword', {
    title: 'Reset your password',
  });
});

exports.getLoginForm = catchAsyncError(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

exports.getLanding = catchAsyncError(async (req, res, next) => {
  res.status(200).render('landing', {
    title: 'Landing page',
  });
});

exports.getWelcome = catchAsyncError(async (req, res, next) => {
  res.status(200).render('welcome', {
    title: 'Welcome page',
  });
});

exports.getSignupForm = catchAsyncError(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign up',
  });
});

exports.getForgotPassForm = catchAsyncError(async (req, res, next) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot password',
  });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  let to;
  const user = await User.findById(req.params.id);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || RESULTS_LIMIT;
  req.query.user = req.params.id;
  const { taskStatus, createdAt } = req.query;
  const from = createdAt ? createdAt.gte : '';
  const toDate = createdAt ? createdAt.lt : '';

  if (toDate) {
    const toPlusOneDay = new Date(toDate);
    toPlusOneDay.setDate(toPlusOneDay.getDate() - 1);
    to = toPlusOneDay.toISOString().split('T')[0];
  }
  const requestQueries = new RequestQueryHandler(Task.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // totalDocCount = await Task.countDocuments();

  const tasks = await requestQueries.query;

  res.status(200).render('user', {
    title: 'User',
    email: user.email,
    name: user.name,
    tasks,
    taskStatus,
    from,
    to,
    page,
    limit,
  });
});

//TODO: fix error handling
exports.getTask = catchAsyncError(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  const { images } = task;

  // const localDirectory = '/public/pics/tasks';

  const remoteDirectory = '/home/tasks';

  const config = {
    host: process.env.VPS_HOST,
    port: process.env.VPS_PORT,
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
  };
  const client = new Client();

  try {
    await client.connect(config);
    await Promise.all(
      images.map(async (file) => {
        // const localFilePath = path.resolve(localDirectory, file);
        const localFilePath = `public/pics/tasks/${file}`;
        const remote = path.posix.join(remoteDirectory, file);
        await client.get(remote, localFilePath);
      }),
    );

    client.end();

    // res.status(201).json({ status: 'success' });
  } catch (err) {
    console.error('SFTP Error:', err);
    // return res.status(500).json({ error: 'Error transferring files' });
    return new AppError('Error transferring files', 503);
  }
  const completed = task.completedAt
    ? task.completedAt.toLocaleDateString('en-GB')
    : '';
  res.status(200).render('task', {
    title: 'Task',
    taskId: req.params.id,
    role: req.user.role,
    date: task.createdAt.toLocaleDateString('en-GB'),
    taskStatus: task.taskStatus,
    model: task.carModel,
    customer: task.user.name,
    totalCost: task.totalCost,
    uploadedImages: images,
    remark: task.remark,
    completed,
  });
});

exports.getMe = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).render('account', {
    title: 'My Profile',
    user,
  });
});

exports.getMyTasks = catchAsyncError(async (req, res, next) => {
  let requestQueries;
  // let totalDocCount;
  let to;

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || RESULTS_LIMIT;
  const { taskStatus, createdAt } = req.query;
  const from = createdAt ? createdAt.gte : '';
  const toDate = createdAt ? createdAt.lt : '';

  if (toDate) {
    const toPlusOneDay = new Date(toDate);
    toPlusOneDay.setDate(toPlusOneDay.getDate() - 1);
    to = toPlusOneDay.toISOString().split('T')[0];
  }

  if (req.user.role === 'user') {
    requestQueries = new RequestQueryHandler(
      Task.find({ user: req.user.id }),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // totalDocCount = await Task.countDocuments({ user: req.user.id });
  }

  if (req.user.role === 'admin') {
    requestQueries = new RequestQueryHandler(Task.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // totalDocCount = await Task.countDocuments();
  }

  const tasks = await requestQueries.query;
  // const totalDocCount = tasks.length;
  // console.log(totalDocCount);
  // const totalPageCount = Math.ceil(totalDocCount / limit);
  res.status(200).render('tasks', {
    title: 'Tasks',
    role: req.user.role,
    tasks,
    page,
    // totalPageCount,
    taskStatus,
    limit,
    from,
    to,
  });
});

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find().populate('tasks').sort({ name: 1 });
  // console.log(users[0].tasks.length);
  res.status(200).render('usersList', {
    title: 'My Profile',
    users,
  });
});
