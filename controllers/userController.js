const User = require('../models/userModel');
const catchAsyncErr = require('../utils/catchAsyncError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// exports.getAllUsers = catchAsyncErr(async (req, res, next) => {
//   const allUsers = await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: allUsers.length,
//     data: { users: allUsers },
//   });
// });

exports.getAllUsers = factory.getAll(User);

exports.getMe = catchAsyncErr(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateMe = catchAsyncErr(async (req, res, next) => {
  //Prevent unauthorized altering of permission fields, like user role
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

exports.updateUser = factory.updateOne(User);

// exports.updateUser = catchAsyncErr(async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(201).json({
//     status: 'success',
//     data: { user: updatedUser },
//   });
// });

// Delete logged in user (req.user.id)
exports.deleteMe = catchAsyncErr(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  // STATUS 200 or 204(no content in response)?
  res.status(200).json({
    status: 'success',
    message: 'Account successfully deleted',
    data: null,
  });
});

exports.getUser = factory.getOne(User, 'tasks');
// exports.getUser = catchAsyncErr(async (req, res, next) => {
//   const customer = await User.findById(req.params.id).populate('tasks');
//   if (!customer) {
//     return next(new AppError('No customer found with that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: { customer },
//   });
// });
exports.suggestUser = catchAsyncErr(async (req, res, next) => {
  console.log('req came');
  const query = req.query.q;
  console.log(query);
  try {
    const results = await User.find({
      name: { $regex: query, $options: 'i' },
    }).limit(5);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
