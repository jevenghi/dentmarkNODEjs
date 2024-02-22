const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 1000; //Lock time after login attempts limit reached

module.exports = {
  MAX_LOGIN_ATTEMPTS,
  LOCK_TIME,
};
