const axios = require('axios');
const { RESULTS_LIMIT } = require('../constants/queryConstants');

const Task = require('../models/taskModel');
const User = require('../models/userModel');
const catchAsyncError = require('../utils/catchAsyncError');
// const { showAlert } = require('../public/js/alerts');

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

exports.getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate({
    path: 'tasks',
    options: { sort: { createdAt: -1 } },
  });
  res.status(200).render('user', {
    title: 'User',
    email: user.email,
    name: user.name,
    tasks: user.tasks,
  });
});

exports.getTask = catchAsyncError(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  let dentsHTML = '';

  const taskDents = task.dents.toObject();
  let groupedDents = taskDents.reduce((acc, obj) => {
    const { img } = obj;
    if (!acc[img]) {
      acc[img] = [];
    }
    acc[img].push(obj);
    return acc;
  }, {});

  Object.entries(groupedDents).forEach(([side, dents]) => {
    dentsHTML += `
        <div class="image-container__summary">
          <img id="vehicleImage" src="/pics/sides_pics/${side}.png" />
        `;
    dents.forEach((dent) => {
      const { shape, length, orientation, paintDamaged, coords, markerNumber } =
        dent;
      let markerStyle = `left: ${coords.x - 1}%; top: ${coords.y - 3}%;`;
      const numberStyle = `left: ${coords.x - 5}%; top: ${coords.y - 5}%;`;
      if (shape === 'line') {
        markerStyle += `width: 2rem; border-radius: 0.8rem; transform: rotate(${orientation});`;
      }
      let markerClass = 'marker';
      if (paintDamaged === 'yes') markerClass += ' paint-damaged';
      if (length === 'small') {
        markerClass += ' small';
        markerStyle += 'background: #78fa7e;';
      } else if (length === 'medium') {
        markerClass += ' medium';
        markerStyle += 'background: #faf878;';
      } else if (length === 'big') {
        markerClass += ' big';
        markerStyle += 'background: #e96f4b;';
      }
      dentsHTML += `

        <div class="${markerClass}" style="${markerStyle}">

          ${paintDamaged === 'yes' ? '<span>X</span>' : ''}
        </div>
      `;
      dentsHTML += `

        <div class="marker-number" style="${numberStyle}">
          <span>${markerNumber}</span>
        </div>
      `;
      // dentsHTML += `

      //   <div class="${markerClass}" style="${markerStyle}">

      //     ${paintDamaged === 'yes' ? '<span>X</span>' : ''}
      //     <span class="marker-number">${markerNumber}</span>
      //   </div>
      // `;
    });
    dentsHTML += `</div>`;
  });
  res.status(200).render('task', {
    title: 'Task',
    taskId: req.params.id,
    role: req.user.role,
    date: task.createdAt.toLocaleDateString('en-GB'),
    taskStatus: task.taskStatus,
    model: task.carModel,
    dents: taskDents,
    customer: task.user.name,
    dentsHTML: dentsHTML,
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
  // let tasks;
  // let role;
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || RESULTS_LIMIT;
  const { status, sort } = req.query;

  // Constructing the API URL with query parameters
  let apiUrl = `http://127.0.0.1:5501/api/v1/tasks?`;

  if (status) apiUrl += `taskStatus=${status}&`;
  if (sort) apiUrl += `sort=${sort}&`;
  if (limit) apiUrl += `limit=${limit}&`;
  if (page) apiUrl += `page=${page}&`;

  // if (req.user.role === 'user') {
  //   tasks = await Task.find({ user: req.user.id })
  //     // .populate({ path: 'user', select: 'name' })
  //     .sort({ createdAt: -1 });

  //   role = 'user';
  // } else if (req.user.role === 'admin') {
  //   tasks = await Task.find()
  //     .populate({ path: 'user', select: 'name' })
  //     .sort({ createdAt: -1 });

  //   role = 'admin';
  // }

  const response = await axios({
    method: 'GET',
    url: apiUrl,
    headers: {
      Authorization: `Bearer ${req.cookies.jwt}`,
    },
  });
  const { tasks } = response.data;
  const totalDocCount = response.data.totalTasks;
  const totalPageCount = Math.ceil(totalDocCount / limit);

  res.status(200).render('tasks', {
    title: 'Tasks',
    role: req.user.role,
    tasks,
    page,
    totalPageCount,
    status,
    limit,
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
