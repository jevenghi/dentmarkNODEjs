/* eslint-disable no-undef */
// import { showAlert } from './alerts.js';

// fetch('http://127.0.0.1:5501/api/v1/auth/checkAuth')
//   .then((response) => {
//     response.json();
//   })
//   .then((data) => {
//     if (!data.loggedIn) {
//       // document.querySelector('.logged-in').style.display = 'flex';
//       // document.querySelector('.logged-out').style.display = 'none';
//       // window.location.href = '/';
//       window.location.href = 'landing.html';
//     } else {
//       document.querySelector('.main-container').style.display = 'flex';
//       document.querySelector('.header').style.display = 'flex';
//       document.querySelector('.header').style.justifyContent = 'flex-end';

//       // document.querySelector('.loading-message').style.display = 'none';
//     }
//   })
//   .catch((error) =>
//     console.error('Error checking authentication status:', error),
//   );

const checkAuth = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:5501/api/v1/auth/checkAuth',
    });
    if (!res.data.loggedIn) {
      window.location.href = 'landing.html';
    } else {
      document.querySelector('.main-container').style.display = 'flex';
      document.querySelector('.header').style.display = 'flex';
      document.querySelector('.header').style.justifyContent = 'flex-end';
    }
  } catch (err) {
    // showAlert('error', err.response.data.message);
    // showAlert('error', err.response.data.message);
    if (err.response.status === 429) {
      // window.location.href = 'limit-exceeded.html';
      alert(err.response.data);
    } else {
      alert(err.response.data.message);
    }

    // alert(err.response.data.message);
  }
};

checkAuth();
