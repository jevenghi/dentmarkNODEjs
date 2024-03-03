import { updateSettings } from './updateAccount';
import { login, logoutUser } from './login';
import { signup, checkFieldAvailability } from './signup';

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');

const myAccBtn = document.querySelector('.nav__el--myacc');
const logout = document.querySelector('.logout');
const modal = document.querySelector('.modal');
const modalLinks = document.querySelectorAll('.modal__link');
const overlay = document.querySelector('.overlay');

const emailInputSignup = document.getElementById('email-signup');

if (overlay) {
  overlay.addEventListener('click', () => {
    overlay.classList.add('hidden');
    modal.classList.add('hidden');
  });
}

if (myAccBtn) {
  myAccBtn.addEventListener('click', () => {
    modal.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
  });
}

if (logout) {
  logout.addEventListener('click', () => {
    logoutUser();
  });
}

if (modalLinks) {
  modalLinks.forEach((button) => {
    button.addEventListener('click', () => {
      overlay.classList.add('hidden');
      modal.classList.add('hidden');
    });
  });
}

if (emailInputSignup) {
  emailInputSignup.addEventListener('input', () =>
    checkFieldAvailability('email-signup', 'checkEmail'),
  );
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email-signup').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirm_password').value;
    const name = document.getElementById('company').value;

    signup(name, email, password, passwordConfirm, company);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const newPasswordConfirm =
      document.getElementById('confirmNewPassword').value;
    updateSettings(
      { oldPassword, newPassword, newPasswordConfirm },
      'password',
    );
  });
}
