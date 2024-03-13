/* eslint-disable no-plusplus */
const generatePDF = require('../utils/generatePDF');
const pug = require('pug');

const Task = require('../models/taskModel');
const Dent = require('../models/dentModel');
const RequestQueryHandler = require('../utils/requestQueryHandler');
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

//WITH FACTORY HANDLER
// exports.getAllTasks = factory.getAll(Task);

//for role based queries
exports.getAllTasks = catchAsyncErr(async (req, res, next) => {
  let requestQueries;
  let totalDocCount;

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

  res.status(200).json({
    status: 'success',
    tasks,
    totalTasks: totalDocCount,
  });
});

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

//ORIGINAL SEND TASK
exports.sendTask = catchAsyncErr(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  // const dentsValues = Object.values(req.body.dents);
  // const accValues = accumulateValues(dentsValues);
  // req.body.difficulty = calcTaskDifficulty(accValues);
  const { dents, ...taskData } = req.body;
  // console.log(dents); // Log the dents array

  // const formattedDents = dents.map((dentType) => dentType);

  // console.log(formattedDents);
  // const taskPayload = {
  //   ...taskData,
  //   dents: formattedDents,
  // };

  await Task.create(req.body);
  res.status(201).json({
    status: 'success',
  });
});

//REFERENCED DENTS
// exports.sendTask = catchAsyncErr(async (req, res, next) => {});

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

    if (task.user.id === req.user.id || req.user.role === 'admin') {
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

//WITH DENTS: [{side: [dentschema]}]
// exports.getDents = catchAsyncErr(async (req, res, next) => {
//   const { id, dentId } = req.params;
//   const { cost, status } = req.body;
//   console.log(cost);
//   const updatedTask = await Task.findByIdAndUpdate(
//     { _id: id },
//     { $set: { 'dents.$[].sedanls.$[inner].cost': cost } },
//     {
//       arrayFilters: [{ 'inner.id': dentId }],
//       new: true,
//     },
//   );

//   res.status(200).json({
//     status: 'success',
//     task: updatedTask,
//   });
// });
exports.updateDents = catchAsyncErr(async (req, res, next) => {
  const taskId = req.params.id;

  const { dentId, cost, taskStatus } = req.body;
  // try {
  const updatedDent = await Task.findOneAndUpdate(
    { _id: taskId, 'dents._id': dentId },
    { $set: { 'dents.$.cost': cost } },
    { new: true, runValidators: true },
  );
  if (taskStatus) {
    await Task.findByIdAndUpdate(taskId, { taskStatus });
  }

  res.status(200).json({
    status: 'success',
    data: updatedDent,
  });
  //   } catch (err) {
  //     res.status(400).json({
  //       status: 'fail',
  //       message: err,
  //     });
  //   }
});

exports.generateUserReport = catchAsyncErr(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
  });
});

exports.generateAdminReport = catchAsyncErr(async (req, res, next) => {
  const { status, from, to } = req.query;
  try {
    let matchStage = {}; // Default empty match stage

    if (status) {
      matchStage = { taskStatus: status };
    }
    const tasks = await Task.find(matchStage).sort({
      createdAt: -1,
    });
    const totalCostAggregate = await Task.aggregate([
      {
        $match: matchStage,
      },
      {
        $unwind: '$dents',
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$dents.cost' },
        },
      },
      {
        $project: {
          _id: 0,
          totalCost: 1,
        },
      },
    ]);

    const pdf = await generatePDF({ tasks, totalCostAggregate });
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);

    // Create PDF
  } catch (err) {
    console.error('Error generating PDF:', err);
    return next(new AppError(`Error generating PDF`, 500));
  }
});
