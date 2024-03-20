import { updateSettings } from './updateAccount';
import { login, logoutUser, forgotPassword } from './login';
import { signup, checkFieldAvailability } from './signup';
import { updatedDent } from './updateDent';
import { generatePDF } from './generatePDF';
import { showAlert } from './alerts';
import { deleteTask } from './deleteTask';
import { placeMarker } from './placeMarker';

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const costInputs = document.querySelectorAll('.dent-cost');
const totalCostInput = document.querySelector('.total-cost');
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
const forgotPassBtn = document.getElementById('forgot-pass');
const vehicleImage = document.getElementById('vehicleImage');
const markers = document.querySelectorAll('.marker');
let url = new URL(window.location.href);

// if (vehicleImage) {
//   vehicleImage.addEventListener('click', (event) => {
//     const side = vehicleImage.dataset.side;
//     console.log(side);
//     const x = (event.offsetX / vehicleImage.clientWidth) * 100;
//     const y = (event.offsetY / vehicleImage.clientHeight) * 100;
//   });
// }

if (markers) {
  markers.forEach((marker) => {
    marker.addEventListener('click', () => {
      const taskId = marker.dataset.taskId;
      const dentId = marker.id;
      const confirmed = confirm('Remove this marker?');
      if (confirmed) {
        updatedDent(taskId, { dentId });
      }
    });
  });
}

if (forgotPassBtn) {
  forgotPassBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const email = document.getElementById('email-forgot-pass').value;
    forgotPassword(email);
  });
}

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
    // url.searchParams.set('taskStatus', selectedStatus);
    if (selectedStatus) {
      url.searchParams.set('taskStatus', selectedStatus);
    } else {
      url.searchParams.delete('taskStatus');
    }
    window.location.href = url.toString();
  });

  fromDateInput.addEventListener('change', function () {
    const fromDate = fromDateInput.value;
    if (fromDate) {
      url.searchParams.set('createdAt[gte]', fromDate);
    } else {
      url.searchParams.delete('createdAt[gte]');
    }

    window.location.href = url.toString();
  });

  toDateInput.addEventListener('change', function () {
    const to = toDateInput.value;
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      const toPlusOneDay = toDate.toISOString().split('T')[0];
      url.searchParams.set('createdAt[lt]', toPlusOneDay);
    } else {
      url.searchParams.delete('createdAt[lt]');
    }

    window.location.href = url.toString();
  });
}

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

if (totalCostInput) {
  totalCostInput.addEventListener('change', () => {
    const taskId = totalCostInput.dataset.taskId;
    const cost = parseFloat(totalCostInput.value);
    let taskStatus = document.querySelector('.task-status-select').value;

    if (isNaN(cost) || cost < 0) {
      return showAlert('error', 'Cost must be a positive number');
    } else if (cost > 10000) {
      return showAlert('error', 'Cost must not exceed 10,000');
    }
    if (taskStatus === 'open') {
      taskStatus = 'in-progress';
      updatedDent(taskId, { taskStatus, cost });
    } else {
      updatedDent(taskId, { cost });
    }
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

if (deleteTaskBtn) {
  deleteTaskBtn.addEventListener('click', function () {
    const taskId = deleteTaskBtn.dataset.taskId;
    deleteTask(taskId);
  });
}
