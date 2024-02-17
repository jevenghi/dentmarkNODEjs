/**
 * Custom error class for handling application errors.
 * @param {string} message - Error message.
 * @param {number} statusCode - HTTP status code associated with the error.
 *
 * This custom error class extends the native Error class to provide additional properties
 * like statusCode, status, and isOperational. It determines the status based on the provided
 * statusCode (4xx for client errors, 5xx for server errors). The isOperational flag is set
 * to true to distinguish operational errors from programming errors. It captures the stack trace
 * to provide useful error information.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
