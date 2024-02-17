/* eslint-disable no-plusplus */
const Task = require('../models/taskModel');
const catchAsyncErr = require('../utils/catchAsyncError');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

// Counts occurrences of dents' 'length' and 'paintDamaged' values
// to use it for determining task's difficulty
const accumulateValues = function (arr) {
  return arr.reduce((acc, nestedArray) => {
    nestedArray.forEach((el) => {
      acc[el.length] = (acc[el.length] || 0) + 1;
      acc[el.paintDamaged] = (acc[el.paintDamaged] || 0) + 1;
    });
    return acc;
  }, {});
};

// Determines task's difficulty level
const calcTaskDifficulty = function (obj) {
  if (obj.big && obj.yes) return 'difficult';
  if (obj.medium && obj.yes) return 'medium';
  return 'easy';
};

// exports.getAllCustomerNames = async (req, res) => {
//   try {
//     const customerNames = await Task.find({}).select('user');

//     if (customerNames.length === 0) {
//       res.status(404).json({
//         status: 'fail',
//         message: 'No customers found',
//       });
//     } else {
//       res.status(200).json({
//         status: 'success',
//         data: { customerNames },
//       });
//     }
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       message: err.message,
//     });
//   }
// };

exports.getAllTasks = factory.getAll(Task);

// exports.getAllTasks = catchAsyncErr(async (req, res, next) => {
//   const requestQueries = new RequestQueryHandler(Task.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tasks = await requestQueries.query.populate({
//     path: 'user',
//     select: 'name',
//   });
//   res.status(200).json({
//     status: 'success',
//     results: tasks.length,
//     data: {
//       tasks,
//     },
//   });
// });

exports.getTask = factory.getOne(Task, { path: 'user', select: 'name' });

// exports.getTask = catchAsyncErr(async (req, res, next) => {
//   const currentTask = await Task.findById(req.params.id).populate({
//     path: 'user',
//     select: 'name',
//   });
//   if (!currentTask) {
//     return next(new AppError('No task found with that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: { currentTask },
//   });
// });

exports.sendTask = catchAsyncErr(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  const dentsValues = Object.values(req.body.dents);
  const accValues = accumulateValues(dentsValues);
  req.body.difficulty = calcTaskDifficulty(accValues);
  const newTask = await Task.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newTask },
  });
});

exports.updateTask = factory.updateOne(Task);

// exports.updateTask = catchAsyncErr(async (req, res) => {
//   const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   res.status(201).json({
//     status: 'success',
//     data: { task: updatedTask },
//   });
// });

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task)
      return next(new AppError(`Task with this ID does not exist`, 404));

    if (task.user.toHexString() === req.user.id || req.user.id === 'admin') {
      await task.deleteOne();
      // Status 200 or 204?
      res.status(200).json({
        status: 'success',
        message: 'Task succesfully deleted',
      });
    } else {
      return next(
        new AppError('Only task creator or an admin can delete the task.', 403),
      );
    }
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
// get use info and tasks via get user route /users/:userid

// exports.getUserTasks = catchAsyncErr(async (req, res, next) => {
//   const user = await User.findById(req.params.userId);
//   if (!user) {
//     return next(new AppError('No user exists with this id', 404));
//   }
//   const userTasks = await Task.find({ user: user });

//   res.status(200).json({
//     status: 'success',
//     data: { userTasks },
//   });
// });
