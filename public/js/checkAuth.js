/* eslint-disable no-undef */
fetch('http://127.0.0.1:5501/api/v1/users/checkAuth')
  .then((response) => response.json())
  .then((data) => {
    if (!data.loggedIn) {
      // document.querySelector('.logged-in').style.display = 'flex';
      // document.querySelector('.logged-out').style.display = 'none';
      // window.location.href = '/';
      window.location.href = 'landing.html';
    }
    // else {
    //   // document.querySelector('.logged-in').style.display = 'none';
    //   // document.querySelector('.logged-out').style.display = 'flex';
    //   window.location.href = 'landing.html';
    // }
  })
  .catch((error) =>
    console.error('Error checking authentication status:', error),
  );
