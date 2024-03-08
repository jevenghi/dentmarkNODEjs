import { updateSettings } from './updateAccount';
import { login, logoutUser } from './login';
import { signup, checkFieldAvailability } from './signup';
import { updatedDent } from './updateDent';
import { generatePDF } from './generatePDF';

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');

const myAccBtn = document.querySelector('.nav__el--myacc');
const logout = document.querySelector('.logout');
const modal = document.querySelector('.modal');
const modalLinks = document.querySelectorAll('.modal__link');
const overlay = document.querySelector('.overlay');
const downloadReportBtn = document.querySelector('.download-report');

const saveDentChangesBtn = document.querySelector('.save-dent-changes');

const emailInputSignup = document.getElementById('email-signup');
const paginationBtns = document.querySelector('.pagination-buttons');
const filterOptions = document.querySelector('.filter-menu');
let url = new URL(window.location.href);

if (paginationBtns) {
  const nextBtn = document.querySelector('.next-button');
  const previousBtn = document.querySelector('.previous-button');

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      let page = parseInt(url.searchParams.get('page') || '1');
      page++;
      url.searchParams.set('page', page);
      window.location.href = url.toString();
    });
  }

  if (previousBtn) {
    previousBtn.addEventListener('click', function () {
      let page = parseInt(url.searchParams.get('page') || '1');
      page--;
      url.searchParams.set('page', page);
      window.location.href = url.toString();
    });
  }
}

if (downloadReportBtn) {
  downloadReportBtn.addEventListener('click', function () {
    generatePDF();
  });
}

if (filterOptions) {
  const fromDateInput = document.getElementById('from-date');
  const toDateInput = document.getElementById('to-date');
  const statusFilter = document.getElementById('status-filter');

  statusFilter.addEventListener('change', function () {
    const selectedStatus = statusFilter.value;
    // let status = parseInt(url.searchParams.get('status') || '');

    url.searchParams.set('status', selectedStatus);
    window.location.href = url.toString();
  });
}
// fromDateInput.addEventListener('change', filterTasks);
// toDateInput.addEventListener('change', filterTasks);

// const dateString = row.querySelector('td:nth-child(4)').textContent;
// const taskStatus = row
//   .querySelector('td:nth-child(3)')
//   .textContent.toLowerCase();

// const [day, month, year] = dateString.split('/').map(Number);

// Create a Date object using the parsed components
// const taskDate = new Date(year, month - 1, day);

// const dateMatch =
//   (!fromDate || taskDate >= fromDate) && (!toDate || taskDate <= toDate);
//       const statusMatch =
//         selectedStatus === '' || taskStatus === selectedStatus;

//       if (statusMatch) {
//         row.style.display = 'table-row';
//       } else {
//         row.style.display = 'none';
//       }
//     });
//   }
// }

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

if (saveDentChangesBtn) {
  saveDentChangesBtn.addEventListener('click', async function () {
    const taskId = this.dataset.taskId;
    const taskStatus = document.querySelector('.task-status-select').value;
    console.log(taskStatus);
    document.querySelectorAll('tbody tr').forEach((row) => {
      const dentId = row.dataset.dentId;
      const cost = row.querySelector('.dent-cost').value;
      updatedDent(taskId, dentId, taskStatus, cost);
    });
  });
}
