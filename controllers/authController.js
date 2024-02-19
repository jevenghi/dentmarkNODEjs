const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');
const sendEmail = require('../utils/email');
const { MAX_LOGIN_ATTEMPTS, LOCK_TIME } = require('../constants/authConstants');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select(
    '+password -passwordConfirm',
  );

  if (
    user &&
    user.loginAttempts >= MAX_LOGIN_ATTEMPTS &&
    user.lockUntil > Date.now()
  ) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
    return next(
      new AppError(
        `Account locked due to too many failed login attempts. Please try again in ${remainingTime} seconds.`,
        401,
      ),
    );
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    if (user) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      await user.save();
    }
    return next(new AppError(`Incorrect email or password`, 401));
  }

  if (user.loginAttempts !== 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  createAndSendToken(user, 200, res);
});

// LOGIN WITHOUT ATTEMPTS LIMIT
// exports.login = catchAsyncError(async (req, res, next) => {
//   const { email, password } = req.body;

//   // 1) Check if email and password exist
//   if (!email || !password) {
//     return next(new AppError('Please provide email and password!', 400));
//   }
//   // 2) Check if user exists && password is correct
//   const user = await User.findOne({ email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401));
//   }

//   // 3) If everything ok, send token to client
//   createAndSendToken(user, 200, res);
// });

exports.protect = catchAsyncError(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(`You are not logged in, please log in.`, 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError(`The user does no longer exist.`, 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        `Invalid credentials or session expired. Please log in again.`,
        401,
      ),
    );
  }

  req.user = currentUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+role');

    if (!roles.includes(user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );
    }

    next();
  };

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(
        'Password reset failed. Please check your email address and try again.',
        404,
      ),
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Follow the link to reset your password: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to your e-mail address.',
    });
  } catch (err) {
    // Reset password reset token and expiry
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('Password reset failed. Please try again later.', 500),
    );
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired'), 403);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  if (!(await user.correctPassword(oldPassword, user.password))) {
    return next(new AppError(`Incorrect old password`, 401));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();

  createAndSendToken(user, 200, res);
});
