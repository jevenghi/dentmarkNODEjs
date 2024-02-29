/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// const showAlert = require('./alerts');
import { showAlert } from './alerts.js';
import axios from 'axios';

export const login = async (email, password) => {
  try {
    document.getElementById('loginButton').textContent = 'Logging in...';

    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:5501/api/v1/auth/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      // showAlert('success', 'Login successful');
      // console.log('login success');
      // alert('login success');

      window.setTimeout(() => {
        location.assign('/');
        document.getElementById('loginButton').textContent = 'Login';
      }, 1500);
    }
  } catch (err) {
    // if (err.response.status === 429) {
    //   console.log('429 caught');
    //   window.location.href = 'limit-exceeded.html';
    // } else {
    showAlert('error', err.response.data.message);
    document.getElementById('loginButton').textContent = 'Login';
  }
  // showAlert('error', err.response.data.message);

  // console.log(err.response);
  // alert(err.response.data.message);
};
