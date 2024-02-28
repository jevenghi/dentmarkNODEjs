import { showAlert } from './alerts.js';

const resetPassword = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:5501/api/v1/auth/resetPassword',
      data: {
        password,
        passwordConfirm,
        token,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      const message = document.createElement('div');
      message.classList.add('success-message');
      message.innerHTML = `
        <div class="message-box">
          <p>Password changed successfully!</p>
          <a href="/" class="btn">Go to Main Page</a>
        </div>
        
        `;
      document.querySelector('.container').appendChild(message);
      document.querySelector('.login-form').style.display = 'none';
    }
  } catch (err) {
    const message = document.createElement('div');
    message.classList.add('success-message');
    message.innerHTML = `
      <div class="message-box">
        <p>${err.response.data.message}</p>
      </div>

      `;
    document.querySelector('.container').appendChild(message);
    document.querySelector('.login-form').style.display = 'none';
    // showAlert('error', err.response.data.message);
    // console.log(err);
    // alert(err.response.data.message);
  }
};

document.querySelector('.login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  resetPassword(password, passwordConfirm, token);
});