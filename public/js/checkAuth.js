/* eslint-disable no-undef */
fetch('api/v1/users/checkAuth')
  .then((response) => response.json())
  .then((data) => {
    if (data.loggedIn) {
      document.querySelector('.logged-in').style.display = 'flex';
      document.querySelector('.logged-out').style.display = 'none';
    } else {
      document.querySelector('.logged-in').style.display = 'none';
      document.querySelector('.logged-out').style.display = 'flex';
    }
  })
  .catch((error) =>
    console.error('Error checking authentication status:', error),
  );
