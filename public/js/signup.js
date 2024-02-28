/* eslint-disable no-undef */

import { showAlert } from './alerts.js';

const checkFieldAvailability = async (field, endpoint) => {
  const value = document.getElementById(field).value;
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:5501/api/v1/auth/${endpoint}`,
      data: { value },
    });
    const availabilityMessage =
      document.getElementById(field).nextElementSibling;
    if (res.data.status === 'success') {
      availabilityMessage.textContent = '';
      // inputElement.classList.remove('field-exists');
      // inputElement.classList.add('field-available');
    } else {
      availabilityMessage.textContent = 'This email is already registered';
      // inputElement.classList.remove('field-available');
      // inputElement.classList.add('field-exists');
    }
  } catch (err) {
    showAlert('error', err.response.data);
    // console.error(`Error checking ${endpoint}:`, err);
  }
};

const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:5501/api/v1/auth/register',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      // showAlert('success', res.data.message);
      // window.setTimeout(() => {
      //   location.assign('/');
      // }, 1500);
      const successMessage = document.createElement('div');
      successMessage.classList.add('success-message');
      successMessage.innerHTML = `
        <div class="message-box">
          <p>${res.data.message}</p>
        </div>
        `;
      document.querySelector('.container').appendChild(successMessage);
      document.querySelector('.signup-form').style.display = 'none';
      document.querySelector('.privacy-policy-link').style.display = 'none';
    } else {
      showAlert('error', res.data.message);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    // alert(err.response.data.message);
  }
};

const emailInput = document.getElementById('email');
emailInput.addEventListener('input', () =>
  checkFieldAvailability('email', 'checkEmail'),
);

document.querySelector('.signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('confirm_password').value;
  const name = document.getElementById('company').value;

  signup(name, email, password, passwordConfirm, company);
});
