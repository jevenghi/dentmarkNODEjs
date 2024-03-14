const axios = require('axios');
const { RESULTS_LIMIT } = require('../constants/queryConstants');
const RequestQueryHandler = require('../utils/requestQueryHandler');

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

exports.getForgotPassForm = catchAsyncError(async (req, res, next) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot password',
  });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  // const user = await User.findById(req.params.id).populate({
  //   path: 'tasks',
  //   options: { sort: { createdAt: -1 } },
  // });
  // res.status(200).render('user', {
  //   title: 'User',
  //   email: user.email,
  //   name: user.name,
  //   tasks: user.tasks,
  // });
  const user = await User.findById(req.params.id);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || RESULTS_LIMIT;
  let { status, sort, from, to } = req.query;
  let apiUrl = `http://127.0.0.1:5501/api/v1/tasks?user=${req.params.id}&`;

  if (status) apiUrl += `taskStatus=${status}&`;
  if (sort) apiUrl += `sort=${sort}&`;
  if (limit) apiUrl += `limit=${limit}&`;
  if (page) apiUrl += `page=${page}&`;
  if (from) apiUrl += `createdAt[gte]=${from}&`;

  if (to) {
    const toDate = new Date(to);
    toDate.setDate(toDate.getDate() + 1);
    const toPlusOneDay = toDate.toISOString().split('T')[0];
    apiUrl += `createdAt[lt]=${toPlusOneDay}&`;
  }

  if (apiUrl.endsWith('&')) {
    apiUrl = apiUrl.slice(0, -1);
  }

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
  res.status(200).render('user', {
    title: 'User',
    email: user.email,
    name: user.name,
    tasks: tasks,
    status,
    from,
    to,
    page,
    limit,
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
    totalCost: task.totalCost,
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
  let totalDocCount;
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
    totalDocCount = await Task.countDocuments({ user: req.user.id });
  }

  if (req.user.role === 'admin') {
    requestQueries = new RequestQueryHandler(Task.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    totalDocCount = await Task.countDocuments();
  }

  const tasks = await requestQueries.query;
  // const totalDocCount = response.data.totalTasks;
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
