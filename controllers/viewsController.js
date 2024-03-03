const Task = require('../models/taskModel');
const User = require('../models/userModel');
const catchAsyncError = require('../utils/catchAsyncError');

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
  console.log(task);
  let dentsHTML = '';
  const dentsArray = [];
  Object.entries(task.dents).forEach(([side, dents]) => {
    dentsArray.push(...dents);
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
    date: task.createdAt.toLocaleDateString('en-GB'),
    model: task.carModel,
    dents: dentsArray,
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
  let tasks;
  let role;
  if (req.user.role === 'user') {
    tasks = await Task.find({ user: req.user.id })
      // .populate({ path: 'user', select: 'name' })
      .sort({ createdAt: -1 });
    role = 'user';
  } else if (req.user.role === 'admin') {
    tasks = await Task.find()
      .populate({ path: 'user', select: 'name' })
      .sort({ createdAt: -1 });
    role = 'admin';
  }
  res.status(200).render('tasks', {
    title: 'Tasks',
    role: role,
    tasks,
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
