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
  let dentsHTML = '';
  Object.entries(task.dents).forEach(([side, dents]) => {
    dentsHTML += `
      <div class="image-container__summary">
        <img id="vehicleImage" src="/pics/sides_pics/${side}.png" />
        
    `;
    dents.forEach((dent) => {
      const { shape, length, orientation, paintDamaged, coords } = dent;
      let markerStyle = `left: ${coords.x - 1}%; top: ${coords.y - 3}%;`;
      if (shape === 'line') {
        markerStyle += `width: 2rem; border-radius: 0.8rem; transform: rotate(${orientation});`;
      }
      let markerClass = 'marker';
      if (paintDamaged === 'yes') markerClass += ' paint-damaged';
      if (length === 'small') {
        markerClass += ' small';
        markerStyle += 'background: #78fa7e;'; // Apply background color for small
      } else if (length === 'medium') {
        markerClass += ' medium';
        markerStyle += 'background: #faf878;'; // Apply background color for medium
      } else if (length === 'big') {
        markerClass += ' big';
        markerStyle += 'background: #e96f4b;'; // Apply background color for big
      }
      dentsHTML += `
        <div class="${markerClass}" style="${markerStyle}">
          ${paintDamaged === 'yes' ? '<span>X</span>' : ''}
        </div>
      `;
    });
    dentsHTML += `</div>`;
  });

  res.status(200).render('task', {
    title: 'Task',
    // task,
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
