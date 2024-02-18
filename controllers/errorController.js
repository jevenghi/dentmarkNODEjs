const AppError = require('../utils/appError');

/**
 * Handles database cast errors by formatting an appropriate error message.
 * @param {Error} err - The database cast error object.
 * @returns {AppError} - An instance of AppError with the formatted error message and status code.
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handles duplicate key errors in the database by formatting an appropriate error message.
 * @param {Error} err - The duplicate key error object.
 * @returns {AppError} - An instance of AppError with the formatted error message and status code.
 */
const handleDuplicateFieldsDB = (err) => {
  const message = `${err.keyValue.email} is already registered.`;
  return new AppError(message, 400);
};

/**
 * Handles validation errors in the database by formatting an appropriate error message.
 * @param {Error} err - The validation error object.
 * @returns {AppError} - An instance of AppError with the formatted error message and status code.
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handles JSON Web Token (JWT) errors by returning an appropriate error message.
 * @returns {AppError} - An instance of AppError with the JWT error message and status code.
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

/**
 * Handles expired JWT errors by returning an appropriate error message.
 * @returns {AppError} - An instance of AppError with the expired JWT error message and status code.
 */
const handleJWTExpiredError = () =>
  new AppError('Token expired. Please log in again!', 401);

/**
 * Sends detailed error response in development mode, including stack trace.
 * @param {Error} err - The error object.
 * @param {Object} res - Express response object.
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Sends appropriate error response in production mode.
 * Operational errors are sent with error details, while non-operational errors receive a generic message.
 * @param {Error} err - The error object.
 * @param {Object} res - Express response object.
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

/**
 * Express middleware for handling errors in the application.
 * @param {Error} err - The error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 *
 * This middleware catches and handles errors that occur during request processing.
 * It sets the status code and status of the error, then sends an appropriate error
 * response based on the environment (development or production).
 * In development mode, detailed error information including stack trace is sent in the response.
 * In production mode, only operational errors are sent to the client, while non-operational errors
 * result in a generic error message without revealing sensitive information.
 * Different types of errors (e.g., database cast error, duplicate key error, validation error, JWT error)
 * are handled separately with specific error messages and status codes.
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = JSON.stringify(err);
    // error = JSON.parse(error);
    // error.message = err.message;
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
