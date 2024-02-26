import { showAlert } from './alerts.js';

const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:5501/api/v1/auth/forgotPassword',
      data: {
        email,
      },
    });
    if (res.data.status === 'success') {
      const successMessage = document.createElement('div');
      successMessage.classList.add('success-message');
      successMessage.innerHTML = `
        <div class="message-box">
          <p>${res.data.message}</p>
        </div>
        `;
      document.querySelector('.container').appendChild(successMessage);
      document.querySelector('.login-form').style.display = 'none';
    }
  } catch (err) {
    // showAlert('error', err.response.data.message);
    showAlert('error', err.response.data.message);
    console.log(err.response);
    // alert(err.response.data.message);
  }
};

document.querySelector('.login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  forgotPassword(email);
});
