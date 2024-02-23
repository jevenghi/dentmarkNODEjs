/* eslint-disable no-undef */

import { showAlert } from './alerts.js';

const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:5501/api/v1/users/register',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    console.log(res);
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

document.querySelector('.signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('confirm_password').value;
  const name = document.getElementById('company').value;

  signup(name, email, password, passwordConfirm, company);
});
