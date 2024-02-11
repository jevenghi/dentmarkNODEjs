const User = require('../models/userModel');
const catchAsyncErr = require('../utils/catchAsyncError');

exports.signup = catchAsyncErr(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { user: newUser },
  });
});
