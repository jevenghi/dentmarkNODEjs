const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 10 * 60 * 1000; //Lock time after login attempts limit reached
const RATE_LIMIT = 100;

module.exports = {
  MAX_LOGIN_ATTEMPTS,
  LOCK_TIME,
  RATE_LIMIT,
};
