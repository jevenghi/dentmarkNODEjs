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
  } catch (err) {
    console.log(err.response.data);
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
