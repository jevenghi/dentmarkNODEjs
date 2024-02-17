const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsyncErr = require('../utils/catchAsyncError');
const sendEmail = require('../utils/email');

/**
 * Sign JWT token for user authentication.
 * @param {string} id - User ID to be included in the token payload.
 * @returns {string} - JWT token signed with the user ID and environment's secret.
 */
// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Create and send JWT token as a cookie and user data in response.
 * @param {Object} user - User object containing user data.
 * @param {number} statusCode - HTTP status code for the response.
 * @param {Object} res - Express response object to send the response.
 */
const createSendToken = (user, statusCode, res) => {
  // Create JWT token
  const token = signToken(user._id);

  // Define cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  // Set 'secure' flag in production environment
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Set JWT token as cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from user object
  user.password = undefined;

  // Send response with token and user data
  res.status(statusCode).json({
    status: 'success',
    token,
    message: { user },
  });
};

/**
 * Route handler for user signup.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 *
 * This route handler creates a new user by creating a new user document with provided user data
 * (name, email, password, passwordConfirm). It then generates and sends a JWT token in a cookie
 * along with the user data in the response, indicating successful signup.
 */
exports.signup = catchAsyncErr(async (req, res, next) => {
  // Create a new user document with provided user data
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Send response with JWT token and user data
  createSendToken(newUser, 201, res);
});

/**
 * Route handler for user login.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 *
 * This route handler authenticates a user by checking the provided email and password.
 * If the email or password is missing, it sends a 400 error response.
 * If the user does not exist or the password is incorrect, it sends a 401 error response.
 * If authentication is successful, it sends a JWT token along with the user data in the response.
 */
exports.login = catchAsyncErr(async (req, res, next) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  // Check if email or password is missing
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user by email and select the password field
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists and if the provided password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password`, 401));
  }

  // Send response with JWT token and user data
  createSendToken(user, 200, res);
});

/**
 * Middleware to protect routes from unauthorized access.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 *
 * This middleware checks if a valid JWT token is provided in the request headers.
 * If a valid token is found, it verifies the token and retrieves the current user's data.
 * It then checks if the user still exists and if their password has been changed after the token was issued.
 * If everything is valid, it attaches the current user's data to the request object and proceeds to the next middleware.
 * If any checks fail, it returns an error response with the appropriate status code.
 */
exports.protect = catchAsyncErr(async (req, res, next) => {
  let token;

  // Check if the request contains a valid JWT token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError(`You are not logged in, please log in!`, 401));
  }

  // Verify the JWT token and retrieve the decoded payload
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Find the user associated with the decoded user ID
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError(`The user does no longer exist`, 401));
  }

  // Check if the user has changed the password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        `The user recently changed the password. Please log in again!`,
        401,
      ),
    );
  }

  //Assign the currentUser object to the user property of the req object.
  // This allows the currentUser data to be passed along to subsequent middleware
  // functions or route handlers within the same request-response cycle.
  req.user = currentUser;
  next();
});

/**
 * Middleware to restrict access to certain roles.
 * @param {...string} roles - Roles allowed to access the restricted route.
 * @returns {Function} - Express middleware function.
 *
 * This middleware checks if the current user has the required role(s) to access the route.
 * It retrieves the current user's role from the database based on the user ID in the request.
 * If the user's role is not included in the allowed roles, it returns an error response with a 403 status code.
 * If the user has one of the allowed roles, it proceeds to the next middleware.
 */
exports.restrictTo =
  (...roles) =>
  async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+role');
    if (!roles.includes(user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );
    }

    // proceed to the next middleware
    next();
  };

/**
 * Route handler for password reset request.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 *
 * This route handler initiates the password reset process for a user.
 * It finds the user by their email address and generates a password reset token.
 * The token is sent to the user's email address with a reset password link.
 * If successful, it sends a success response with a message indicating that the token
 * has been sent to the user's email.
 * If an error occurs during the process, it returns an error response with an appropriate message.
 */
exports.forgotPassword = catchAsyncErr(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // Create password reset token and save user (without validation)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Construct password reset URL and message
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Follow the link to reset your password: ${resetURL}`;

  try {
    // Send password reset email
    await sendEmail({
      email: user.email,
      subject: 'Password reset',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email',
    });
  } catch (err) {
    // If there's an error sending the email, reset token and return error response
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Please try again later!',
        500,
      ),
    );
  }
});

/**
 * Route handler for resetting user password using a reset token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 *
 * This route handler resets the user's password using a valid reset token.
 * It hashes the token provided in the request parameters and finds the user with
 * a matching hashed reset token and a valid expiration time.
 * If a user is found, it updates the user's password with the new password provided
 * in the request body, clears the password reset token and expiration fields, and saves
 * the updated user data.
 * If the token is invalid or expired, it returns an error response with a 403 status code.
 */
exports.resetPassword = catchAsyncErr(async (req, res, next) => {
  // Hash the reset token provided in the request parameters
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find user with matching hashed reset token and valid expiration time
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired'), 403);
  }

  // Update user's password with new password and clear reset token fields
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Save the updated user data and end success response with updated user data and token
  await user.save();
  createSendToken(user, 200, res);
});

/**
 * Route handler for updating user password.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 *
 * This route handler updates the user's password.
 * It retrieves the current user's data from the database and verifies the old password
 * provided in the request body against the user's current password.
 * If the old password is correct, it updates the user's password with the new password
 * and password confirmation provided in the request body, and saves the updated user data.
 * If the old password is incorrect, it returns an error response with a 401 status code.
 */
exports.updatePassword = catchAsyncErr(async (req, res, next) => {
  // Find the current user by ID and retrieve their password
  const user = await User.findById(req.user.id).select('+password');

  // Destructure old password, new password, and password confirmation from request body
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  // Verify if the old password matches the user's current password
  if (!(await user.correctPassword(oldPassword, user.password))) {
    return next(new AppError(`Incorrect old password`, 401));
  }

  // Update user's password with new password and password confirmation
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();
  createSendToken(user, 200, res);
});
