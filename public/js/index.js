import { updateSettings } from './updateAccount';
import { login, logoutUser } from './login';
import { signup, checkFieldAvailability } from './signup';
import { updatedDent } from './updateDent';
import { generatePDF } from './generatePDF';
import { showAlert } from './alerts';
import { deleteTask } from './deleteTask';

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const costInputs = document.querySelectorAll('.dent-cost');
const myAccBtn = document.querySelector('.nav__el--myacc');
const logout = document.querySelector('.logout');
const modal = document.querySelector('.modal');
const modalLinks = document.querySelectorAll('.modal__link');
const overlay = document.querySelector('.overlay');
const downloadReportBtn = document.querySelector('.download-report');
const taskStatusBtn = document.querySelector('.task-status-select');
const backToTasks = document.querySelector('.back-tasks');
const deleteTaskBtn = document.querySelector('.delete-task');
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
  fromDateInput.addEventListener('change', function () {
    const fromDate = fromDateInput.value;

    url.searchParams.set('from', fromDate);

    window.location.href = url.toString();
  });
  toDateInput.addEventListener('change', function () {
    const toDate = toDateInput.value;

    url.searchParams.set('to', toDate);
    window.location.href = url.toString();
  });
}

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

// if (saveDentChangesBtn) {
//   saveDentChangesBtn.addEventListener('click', async function () {
//     const taskId = this.dataset.taskId;
//     const taskStatus = document.querySelector('.task-status-select').value;
//     console.log(taskStatus);
//     document.querySelectorAll('tbody tr').forEach((row) => {
//       const dentId = row.dataset.dentId;
//       console.log(dentId);
//       const cost = row.querySelector('.dent-cost').value;
//       updatedDent(taskId, dentId, taskStatus, cost);
//     });
//   });
// }
if (costInputs) {
  costInputs.forEach((input) => {
    input.addEventListener('change', () => {
      const taskId = input.dataset.taskId;
      const dentId = input.dataset.dentId;
      let taskStatus = document.querySelector('.task-status-select').value;
      const cost = parseFloat(input.value);
      if (isNaN(cost) || cost < 0) {
        return showAlert('error', 'Cost must be a positive number');
      } else if (cost > 10000) {
        return showAlert('error', 'Cost must not exceed 10,000');
      }
      if (taskStatus === 'open') {
        taskStatus = 'in-progress';
        updatedDent(taskId, { taskStatus, dentId, cost });
      } else {
        updatedDent(taskId, { dentId, cost });
      }
    });
  });
}

if (taskStatusBtn) {
  taskStatusBtn.addEventListener('change', () => {
    const taskId = taskStatusBtn.dataset.taskId;
    const taskStatus = document.querySelector('.task-status-select').value;
    updatedDent(taskId, { taskStatus });
  });
}

if (backToTasks) {
  backToTasks.addEventListener('click', function () {
    window.location.href = '/tasks';
  });
}
// document.querySelectorAll('tbody tr').forEach((row) => {
//   const costInput = row.querySelector('.dent-cost');
//   const taskId = row.dataset.taskId;
//   const dentId = row.dataset.dentId;
//   const taskStatus = document.querySelector('.task-status-select').value;
//   costInput.addEventListener('change', () => {
//     const cost = parseFloat(row.querySelector('.dent-cost').value);
//     if (isNaN(cost) || cost < 0) {
//       return showAlert('error', 'Cost must be a positive number');
//     } else if (cost > 10000) {
//       return showAlert('error', 'Cost must not exceed 10,000');
//     }
//     updatedDent(taskId, dentId, taskStatus, cost);
//   });
// });
// saveDentChangesBtn.addEventListener('click', async function () {
//   const taskStatus = document.querySelector('.task-status-select').value;
// });
if (deleteTaskBtn) {
  deleteTaskBtn.addEventListener('click', function () {
    const taskId = deleteTaskBtn.dataset.taskId;
    deleteTask(taskId);
  });
}
