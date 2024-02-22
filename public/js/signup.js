/* eslint-disable no-undef */

const signup = async (name, email, password, passwordConfirm, company) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:5501/api/v1/users/register',
      data: {
        name,
        email,
        password,
        passwordConfirm,
        company,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      // console.log('login success');
      alert(res.data.message);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    alert(err.response.data.message);
    // alert(err.response.data.message);
  }
};

document.querySelector('.signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('confirm_password').value;
  const company = document.getElementById('company').value;

  signup(name, email, password, passwordConfirm, company);
});
