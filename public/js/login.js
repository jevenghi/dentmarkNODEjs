/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// const showAlert = require('./alerts');
import { showAlert } from './alerts.js';

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:5501/api/v1/auth/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Login successful');
      // console.log('login success');
      // alert('login success');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // showAlert('error', err.response.data.message);
    showAlert('error', err.response.data.message);
    // console.log(err.response);
    // alert(err.response.data.message);
  }
};

document.querySelector('.login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
