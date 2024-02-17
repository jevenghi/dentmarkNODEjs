/**
 * Async wrapper for Express route handlers to handle errors using middleware.
 * @param {Function} fn - Express route handler function.
 * @returns {Function} - Express middleware function.
 *
 * This function wraps an async Express route handler to catch any asynchronous errors
 * and pass them to the global error handling middleware (next).
 */
// eslint-disable-next-line arrow-body-style
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
