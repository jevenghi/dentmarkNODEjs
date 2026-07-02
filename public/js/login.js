/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// const showAlert = require('./alerts');
import { showAlert } from './alerts.js';
import axios from 'axios';
import { translations } from './translations';

const t = (key) =>
  translations[document.documentElement.lang || 'en']?.[key] ||
  translations.en[key];

export const login = async (email, password) => {
  try {
    // document.getElementById('loginButton').textContent = 'Logging in...';
    // document.getElementById('loginButton').textContent = '';
    spinner.style.display = 'block';

    const res = await axios({
      method: 'POST',
      url: '/api/v1/auth/login',
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
        document.getElementById('loginButton').textContent = t('login');
      }, 1500);
    }
  } catch (err) {
    // if (err.response.status === 429) {
    //   console.log('429 caught');
    //   window.location.href = 'limit-exceeded.html';
    // } else {
    showAlert('error', err.response.data.message);
    document.getElementById('loginText').style.display = 'inline';
    document.getElementById('spinner').style.display = 'none';
  }
};

export const logoutUser = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    location.assign('/');
  } catch (err) {
    showAlert('error', err.response.data.message);

    console.log(err.response.data.message);
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/auth/forgotPassword',
      data: {
        email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', res.data.message, () => {
        location.href = '/';
      });
      // const successMessage = document.createElement('div');
      // successMessage.classList.add('success-message');
      // successMessage.innerHTML = `
      //   <div class="message-box">
      //     <p>${res.data.message}</p>
      //   </div>
      //   `;
      // document.querySelector('.container').appendChild(successMessage);
      // document.querySelector('.forgot-pass-form').style.display = 'none';
    }
  } catch (err) {
    // showAlert('error', err.response.data.message);
    showAlert('error', err.response.data.message);
    console.log(err.response);
    // alert(err.response.data.message);
  }
};
