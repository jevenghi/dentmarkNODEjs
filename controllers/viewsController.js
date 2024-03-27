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

const isFrontOrRear = function (side) {
  return side.slice(-2) === 'fr' || side.slice(-2) === 're';
};

exports.getTask = catchAsyncError(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  const { bodyType } = task;
  let dentsHTML = '';
  let sidesLeft = ['re', 'ls', 'rs', 'fr', 'top'].map((el) => bodyType + el);

  const taskDents = task.dents.toObject();
  // const taskDents = task.dents.toObject().reverse();

  const groupedDents = taskDents.reduce((acc, obj) => {
    const { img } = obj;
    if (!acc[img]) {
      acc[img] = [];
    }
    acc[img].push(obj);
    return acc;
  }, {});

  Object.entries(groupedDents).forEach(([side, dents]) => {
    sidesLeft = sidesLeft.filter((el) => el !== side);
    dentsHTML += `
        <div class="image-container">
          <img id="vehicleImage" src="/pics/sides_pics/${side}.png" data-side="${side}" data-task-id="${req.params.id}"/>
        `;
    dents.forEach((dent) => {
      const { img, shape, length, orientation, paintDamaged, coords, _id } =
        dent;
      // let markerStyle = isFrontOrRear(img) ? `left: ${coords.x - 2}%; top: ${coords.y - 3.5}%;` : `left: ${coords.x - 1}%; top: ${coords.y - 3}%;`;
      let markerStyle = '';

      let markerClass = 'marker';
      if (paintDamaged === 'yes') markerClass += ' paint-damaged';

      if (length === 'small') {
        markerClass += ' small';
        if (shape === 'nonagon') {
          markerStyle += `width: ${isFrontOrRear(side) ? '1.3rem' : '0.5rem'}; height: ${isFrontOrRear(side) ? '1.3rem' : '0.5rem'};`;
          markerStyle += isFrontOrRear(img)
            ? `left: ${coords.relativeX - 2}%; top: ${coords.relativeY - 2.6}%;`
            : `left: ${coords.relativeX - 0.8}%; top: ${coords.relativeY - 2.6}%;`;
        } else if (shape === 'line') {
          markerStyle += isFrontOrRear(img)
            ? `left: ${coords.relativeX - 2}%; top: ${coords.relativeY - 1.5}%;`
            : `left: ${coords.relativeX - 1}%; top: ${coords.relativeY - 1.8}%;`;
          markerStyle += `width: ${isFrontOrRear(side) ? '1.5rem' : '0.8rem'}; height: ${isFrontOrRear(side) ? '0.6rem' : '0.3rem'}; border-radius: 0.8rem; transform: rotate(${orientation});`;
        }
      } else if (length === 'medium') {
        markerClass += ' medium';
        if (shape === 'nonagon') {
          markerStyle += isFrontOrRear(img)
            ? `left: ${coords.relativeX - 2.6}%; top: ${coords.relativeY - 3.6}%;`
            : `left: ${coords.relativeX - 1}%; top: ${coords.relativeY - 3}%;`;
          markerStyle += `width: ${isFrontOrRear(side) ? '2rem' : '0.8rem'}; height: ${isFrontOrRear(side) ? '2rem' : '0.8rem'};`;
        } else if (shape === 'line') {
          markerStyle += isFrontOrRear(img)
            ? `left: ${coords.relativeX - 3.2}%; top: ${coords.relativeY - 1.8}%;`
            : `left: ${coords.relativeX - 2}%; top: ${coords.relativeY - 2.6}%;`;
          markerStyle += `width: ${isFrontOrRear(side) ? '2.2rem' : '1.4rem'}; height: ${isFrontOrRear(side) ? '0.8rem' : '0.5rem'}; border-radius: 0.8rem; transform: rotate(${orientation});`;
        }
      } else if (length === 'big') {
        markerClass += ' big';
        if (shape === 'nonagon') {
          markerStyle += isFrontOrRear(img)
            ? `left: ${coords.relativeX - 3.4}%; top: ${coords.relativeY - 5}%;`
            : `left: ${coords.relativeX - 2}%; top: ${coords.relativeY - 5.3}%;`;
          markerStyle += `width: ${isFrontOrRear(side) ? '2.6rem' : '1.6rem'}; height: ${isFrontOrRear(side) ? '2.6rem' : '1.6rem'};`;
        } else if (shape === 'line') {
          markerStyle += isFrontOrRear(img)
            ? `left: ${coords.relativeX - 3.8}%; top: ${coords.relativeY - 2.5}%;`
            : `left: ${coords.relativeX - 3.2}%; top: ${coords.relativeY - 4.2}%;`;
          markerStyle += `width: ${isFrontOrRear(side) ? '2.9rem' : '2.2rem'}; height: ${isFrontOrRear(side) ? '1.2rem' : '0.8rem'}; border-radius: 0.8rem; transform: rotate(${orientation});`;
        }
      }
      dentsHTML += `

        <div class="${markerClass}" style="${markerStyle}" id ="${_id}" data-task-id="${req.params.id}">

          ${paintDamaged ? '<span>X</span>' : ''}
        </div>
      `;
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
    sidesLeft,
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
