const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');
const sendEmail = require('../utils/email');
const {
  MAX_LOGIN_ATTEMPTS,
  LOCK_TIME,
  RATE_LIMIT,
} = require('../constants/authConstants');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// const createEmailConfirmationToken =

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

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.sendAuthStatus = (req, res) => {
  if (res.locals.user) {
    res.json({ loggedIn: true, user: res.locals.user });
  } else {
    res.json({ loggedIn: false });
  }
};
//TODO: if email confirmation expires, remove document from DB
exports.signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const confirmationToken = newUser.createEmailConfirmationToken();

  await newUser.save({ validateBeforeSave: false });

  const confirmationURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/auth/confirmEmail/${confirmationToken}`;
  const message = `Please confirm your registration at DentMark.AM by clicking the link below:\n${confirmationURL}. Unverified accounts are automatically deleted 30 days after signup. If you didn't request this, please ignore this email.`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Confirm your signup at DentMark.AM',
      message,
    });

    res.status(201).json({
      status: 'success',
      message: `User created. Please complete your registration, following the instructions sent to your e-mail address. If you haven't received the email, please check your spam folder`,
    });
  } catch (err) {
    newUser.emailConfirmationToken = undefined;
    newUser.emailConfirmationTokenExpires = undefined;
    await newUser.save();

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
  // createAndSendToken(newUser, 200, res);
});

exports.checkEmail = catchAsyncError(async (req, res, next) => {
  // console.log(req.rateLimit.remaining);
  const email = req.body.value;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res
      .status(200)
      .json({ status: 'error', message: 'Email already registered' });
  } else {
    res.status(200).json({ status: 'success', message: 'Email available' });
  }
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
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    const units = remainingTime > 1 ? 'minutes' : 'minute';

    return next(
      new AppError(
        `Account locked. Please try again in ${remainingTime} ${units}.`,
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

  if (!user.emailConfirmed) {
    return next(
      new AppError(
        'Please complete your signup process, following the instructions sent to your email address',
        403,
      ),
    );
  }

  if (user.loginAttempts !== 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  // res.cookie('jwt', 'loggedout', {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // });
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};
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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

  const resetURL = `${req.protocol}://${req.get('host')}/resetPassword.html?token=${resetToken}`;
  const message = `Follow the link to reset your password: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Instructions sent to your e-mail address.',
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
    .update(req.body.token)
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

exports.confirmEmail = catchAsyncError(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailConfirmationToken: hashedToken,
    emailConfirmationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired'), 403);
  }

  user.emailConfirmed = true;
  user.emailConfirmationToken = undefined;
  user.emailConfirmationTokenExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.redirect('/welcome');
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  if (!(await user.correctPassword(oldPassword, user.password))) {
    return next(new AppError(`Incorrect current password`, 401));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();

  createAndSendToken(user, 200, res);
});
