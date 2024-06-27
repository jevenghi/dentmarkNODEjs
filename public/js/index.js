import { updateSettings } from './updateAccount';
import { login, logoutUser, forgotPassword } from './login';
import { signup, checkFieldAvailability } from './signup';
import { updateTask } from './updateTask';
import { generatePDF } from './generatePDF';
import { showAlert } from './alerts';
import { deleteTask } from './deleteTask';
import {
  placeMarker,
  addDentsToTask,
  removeAllMarkers,
  markerRemover,
  removeLastMarker,
} from './placeMarker';
import { resetPassword } from './resetPassword';
import {
  uploadPhotosTemp,
  renderVehicleImageFromUploads,
  getImagesAndDents,
} from './photosHandler';
import { sendTask } from './sendTask';
import { translateContent, userAutoSuggest } from './searchUsers';
import { generateTaskPDF, createShortcutContainer } from './makeScreenshot';
import { UPLOADED_IMAGE_WIDTH } from '../../constants/markerConstants';
import { translations } from './translations';
import {
  makeMarkerContainerFloating,
  warnUnsavedChanges,
} from './elementsHandler';

const passwordResetForm = document.querySelector('.reset-form');
const sendContainer = document.querySelector('.send-container');
const sendMarksBtn = document.querySelector('.send-marks');
const vehicleModel = document.querySelector('.form__input--model');
const newTaskNote = document.querySelector('.form__input--note');
const removeLastMarkBtn = document.querySelector('.remove__last');
const removeMarksBtn = document.querySelector('.remove--marks');
const deleteImage = document.querySelector('.remove__photo');

const downloadTaskBtn = document.querySelector('.download-task-report');
const removeMarksContainer = document.querySelector('.remove-container');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const totalCostInput = document.querySelector('.total-cost');
const remarkInput = document.querySelector('.task-remark');

const myAccBtn = document.querySelector('.nav__el--myacc');
const logout = document.querySelector('.logout');
const modal = document.querySelector('.modal');
const modalLinks = document.querySelectorAll('.modal__link');
const overlay = document.querySelector('.overlay');
const downloadReportBtn = document.querySelector('.download-report');
const taskStatusBtn = document.querySelector('.task-status-select');
const modelNameInput = document.querySelector('.model-input');
const backToTasks = document.querySelector('.back-tasks');
const deleteTaskBtn = document.querySelector('.delete-task');
const emailInputSignup = document.getElementById('email-signup');
const logoImage = document.getElementById('logoImage');
const paginationBtns = document.querySelector('.pagination-buttons');
const filterOptions = document.querySelector('.filter-menu');
const forgotPassBtn = document.getElementById('forgot-pass');
let vehicleImage = document.getElementById('vehicleImage');
const sideText = document.querySelector('.choose__side');

const markerContainer = document.querySelector('.marker-container');

const paintDamagedCheck = document.getElementById('paint-damaged');
const specialCaseCheck = document.getElementById('special-case');
const bigDentCheck = document.getElementById('big-dent');

const imageContainer = document.querySelector('.image-container');

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const selectedYear = document.getElementById('year');
const taskHeader = document.querySelector('.task-header');
const addNewDentsToTask = document.querySelector('.save-new-dents');
let buttonsSide = document.querySelectorAll('.button--side');
const fileInput = document.getElementById('photo');
let sideSelection = document.querySelector('.sides-container');

let url = new URL(window.location.href);
let defaultLang = 'en';
let img;
let customer;
let storedCoordinates;
let uploadedImages = [];
let dents = [];
let dentsTemp = {};
let dentPaintDamaged = false;
let specialCase = false;
let bigDent = false;
let taskId;
let warnBeforeUnload = true;

function generateRandomId() {
  return Array.from({ length: 4 }, () => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return characters.charAt(Math.floor(Math.random() * characters.length));
  }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  translateContent(defaultLang, translations);
});

window.addEventListener('beforeunload', () => {
  warnUnsavedChanges(uploadedImages, dents, warnBeforeUnload);
});

const unhideSaveChangesBtn = () => {
  if (addNewDentsToTask) addNewDentsToTask.classList.remove('hidden');
};
const buttonsSideHandler = (button, markers) => {
  buttonsSide.forEach((btn) => {
    btn.style.border = 'none';
  });
  removeAllMarkers(markers, imageContainer);

  button.style.border = '0.3rem solid coral';
  img = button.value;
  let vehicleImage = document.getElementById('vehicleImage');
  vehicleImage.style.width = UPLOADED_IMAGE_WIDTH;
  vehicleImage.src = `/pics/tasks/${img}`;
  vehicleImage.setAttribute('data-image-id', img);

  removeMarksContainer.classList.remove('hidden');
  if (sendMarksBtn) sendMarksBtn.classList.remove('hidden');
  paintDamagedCheck.checked = false;
  bigDentCheck.checked = false;
  dentPaintDamaged = false;
  bigDent = false;

  if (sendContainer) sendContainer.classList.remove('hidden');
  markerContainer.classList.remove('hidden');
  setTimeout(function () {
    markerContainer.classList.add('visible');
  }, 50);

  makeMarkerContainerFloating();

  const searchBar = document.querySelector('.search-bar');
  if (searchBar) searchBar.classList.remove('hidden');

  const sideDents = dentsTemp[img];

  if (sideDents && sideDents.length > 0) {
    sideDents.forEach((dent) => {
      placeMarker(
        dent.bigDent,
        dent.paintDamaged,
        dent.coords,
        imageContainer,
        dent.markerId,
      );
    });
  }
};

async function loadDataAndPopulate(taskId) {
  try {
    const { images, groupedDents } = await getImagesAndDents(taskId);
    uploadedImages = images;
    dentsTemp = groupedDents;
  } catch (error) {
    console.error(error);
    showAlert('error', error);
  }
}

function makeButtonsSideVisible() {
  sideText.classList.remove('hidden');
  sideSelection = document.querySelector('.sides-container');

  setTimeout(function () {
    sideSelection.classList.add('visible');
  }, 50);
}

// SEND NEW TASK / MAIN PAGE also on TASK page
if (sideSelection) {
  let currentButtonListeners = [];

  const observer = new MutationObserver(() => {
    buttonsSide = document.querySelectorAll('.button--side');
    // const lastButton = buttonsSide[buttonsSide.length - 1];
    const markers = imageContainer.getElementsByClassName('marker');
    // buttonsSideHandler(lastButton, markers);

    if (currentButtonListeners.length > 0) {
      buttonsSide.forEach((button, index) => {
        button.removeEventListener('click', currentButtonListeners[index]);
      });
    }

    currentButtonListeners = [];

    buttonsSide.forEach((button) => {
      const listener = () => {
        buttonsSideHandler(button, markers);
        if (taskHeader) markerRemover(dentsTemp, img);
      };
      button.addEventListener('click', listener);
      currentButtonListeners.push(listener);
    });
  });

  observer.observe(sideSelection, {
    subtree: true,
    childList: true,
  });

  window.addEventListener('beforeunload', () => {
    observer.disconnect();
  });
}

// if (sideSelection) {
//   sideSelection.addEventListener('click', (event) => {
//     let button = event.target;
//     while (button && !button.classList.contains('button--side')) {
//       button = button.parentElement;
//     }

//     if (button && button.classList.contains('button--side')) {
//       const markers = imageContainer.getElementsByClassName('marker');
//       buttonsSideHandler(button, markers);
//       // if (taskHeader) {
//       //   markerRemover(dentsTemp, img);
//       // }
//     }
//     if (taskHeader) {
//       markerRemover(dentsTemp, img);
//     }
//   });
// }

if (fileInput) {
  const spinner = document.getElementById('spinner');

  fileInput.addEventListener('change', async (e) => {
    e.preventDefault();
    spinner.style.display = 'block';

    const form = new FormData();
    const images = document.getElementById('photo').files;

    Array.from(images).forEach((file) => {
      form.append('images', file);
    });

    try {
      const imagesProcessed = await uploadPhotosTemp(form);
      uploadedImages.push(...imagesProcessed);
    } catch (error) {
      spinner.style.display = 'none';
      fileInput.value = '';

      return showAlert('error', error);
    }
    if (logoImage) {
      logoImage.src = '';
      logoImage.style.width = 0;
    }

    renderVehicleImageFromUploads(uploadedImages);
    spinner.style.display = 'none';

    fileInput.value = '';

    makeButtonsSideVisible();

    buttonsSide = document.querySelectorAll('.button--side');
    const lastButton = buttonsSide[buttonsSide.length - 1];
    const markers = imageContainer.getElementsByClassName('marker');
    buttonsSideHandler(lastButton, markers);
    const chooseSideEl = document.querySelector('.choose__side');
    setTimeout(() => {
      chooseSideEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  });
}

if (markerContainer) {
  const markers = imageContainer.getElementsByClassName('marker');

  removeLastMarkBtn.addEventListener('click', () => {
    removeLastMarker(markers, dents, imageContainer);
    if (dentsTemp[img]) dentsTemp[img].pop();
  });

  removeMarksBtn.addEventListener('click', () => {
    const confirmed = confirm(translations[defaultLang]['removeAllMarks']);

    if (confirmed) {
      removeAllMarkers(markers, imageContainer);
      dents = dents.filter((element) => element.imageId !== img);
      if (dentsTemp[img]) delete dentsTemp[img];
    }
  });

  deleteImage.addEventListener('click', (e) => {
    const confirmed = confirm(translations[defaultLang]['deleteImage']);
    if (confirmed) {
      markerContainer.classList.add('hidden');
      uploadedImages = uploadedImages.filter((element) => element !== img);
      dents = dents.filter((element) => element.imageId !== img);
      if (dentsTemp[img]) delete dentsTemp[img];
      if (vehicleImage) vehicleImage.src = '';
      renderVehicleImageFromUploads(uploadedImages);
    }
  });
  paintDamagedCheck.addEventListener('click', () => {
    dentPaintDamaged = dentPaintDamaged ? false : true;
  });
  bigDentCheck.addEventListener('click', () => {
    bigDent = bigDent ? false : true;
  });
  specialCaseCheck.addEventListener('click', () => {
    specialCase = specialCase ? false : true;
    unhideSaveChangesBtn();
  });
}

// TASK PAGE /tasks/:id

if (taskHeader) {
  taskId = taskHeader.dataset.taskId;

  async function loadDataAndRenderImages() {
    await loadDataAndPopulate(taskId);
    renderVehicleImageFromUploads(uploadedImages);
    makeButtonsSideVisible();
  }

  loadDataAndRenderImages();

  modelNameInput.addEventListener('change', () => {
    const taskId = modelNameInput.dataset.taskId;
    const carModel = modelNameInput.value;
    updateTask(taskId, { carModel });
  });

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
        updateTask(taskId, { taskStatus, cost });
      } else {
        updateTask(taskId, { cost });
      }
    });
  }

  if (remarkInput) {
    remarkInput.addEventListener('change', () => {
      const taskId = remarkInput.dataset.taskId;
      const remark = remarkInput.value;
      updateTask(taskId, { remark });
    });
  }

  if (taskStatusBtn) {
    taskStatusBtn.addEventListener('change', () => {
      const taskId = taskStatusBtn.dataset.taskId;
      const taskStatus = document.querySelector('.task-status-select').value;
      updateTask(taskId, { taskStatus });
    });
  }
}

if (deleteTaskBtn) {
  deleteTaskBtn.addEventListener('click', function () {
    const confirmed = confirm('Delete this task?');
    if (confirmed) {
      dents = [];
      const taskId = deleteTaskBtn.dataset.taskId;
      deleteTask(taskId);
    }
  });
}

if (downloadTaskBtn) {
  downloadTaskBtn.addEventListener('click', async function () {
    downloadTaskBtn.disabled = true;
    const screenshotContainers = createShortcutContainer(uploadedImages);
    backToTasks.insertAdjacentHTML('afterend', screenshotContainers);
    let imagesToCapture = document.querySelectorAll('.screenshot-container');
    imagesToCapture.forEach((image) => {
      const imgName = image.dataset.filename;
      const dents = dentsTemp[imgName];
      if (dents) {
        dents.forEach((dent) => {
          placeMarker(dent.bigDent, dent.paintDamaged, dent.coords, image);
        });
      }
    });
    await generateTaskPDF();
    downloadTaskBtn.disabled = false;
  });
}

if (addNewDentsToTask) {
  addNewDentsToTask.addEventListener('click', async () => {
    // if (dents.length === 0)
    //   return showAlert('error', `You haven't added any dent`);
    warnBeforeUnload = false;

    addNewDentsToTask.textContent = 'Saving...';

    const dents = Object.values(dentsTemp).flat();

    await addDentsToTask(taskId, dents, uploadedImages);
    addNewDentsToTask.textContent = 'Save changes';
  });
}

if (backToTasks) {
  backToTasks.addEventListener('click', function () {
    window.location.href = '/tasks';
  });
}

// TASKS PAGE /tasks

if (downloadReportBtn) {
  downloadReportBtn.addEventListener('click', function () {
    generatePDF();
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

// INPUT FOR USER AUTO-SUGGESTION (Option for admin to register task to specific customer)
if (searchInput) {
  searchInput.addEventListener('input', async function () {
    const userInput = searchInput.value.trim();
    userAutoSuggest(userInput, searchResults);
  });
  searchResults.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
      searchInput.value = customer = event.target.textContent;
      searchResults.style.display = 'none';
    }
  });

  document.addEventListener('click', function (event) {
    if (
      !searchInput.contains(event.target) &&
      !searchResults.contains(event.target)
    ) {
      searchResults.style.display = 'none';
    }
  });
}

// ALSO ON TASK page

if (vehicleImage) {
  vehicleImage.addEventListener('click', (event) => {
    event.preventDefault();
    unhideSaveChangesBtn();
    const imageId = vehicleImage.dataset.imageId;
    const imageRect = vehicleImage.getBoundingClientRect();

    storedCoordinates = {
      x: event.offsetX,
      y: event.offsetY,
      relativeX: ((event.clientX - imageRect.left) / imageRect.width) * 100,
      relativeY: ((event.clientY - imageRect.top) / imageRect.height) * 100,
    };
    const coords = storedCoordinates;
    const markerId = generateRandomId();
    placeMarker(bigDent, dentPaintDamaged, coords, imageContainer, markerId);
    const newObj = {
      imageId: imageId,
      paintDamaged: dentPaintDamaged,
      bigDent: bigDent,
      coords: storedCoordinates,
      status: 'open',
      markerId: markerId,
    };
    dents.push(newObj);
    if (!dentsTemp[imageId]) {
      dentsTemp[imageId] = [];
    }
    dentsTemp[imageId].push(newObj);
  });
}

if (sendMarksBtn) {
  sendMarksBtn.addEventListener('click', async () => {
    if (dents.length === 0 && !specialCase)
      return showAlert('error', translations[defaultLang]['noDentsMarked']);
    let model = vehicleModel.value.trim();
    if (model.length < 5)
      return showAlert(
        'error',
        translations[defaultLang]['modelNameMinLength'],
      );
    const year = selectedYear.value;
    if (!year)
      return showAlert('error', translations[defaultLang]['chooseModelYear']);
    model += ` ${year}`;
    const note = newTaskNote.value.trim();
    if (note.length > 150)
      return showAlert('error', translations[defaultLang]['noteMaxLength']);
    if (specialCase && note.length < 5)
      return showAlert(
        'error',
        translations[defaultLang]['addShortDescription'],
      );
    warnBeforeUnload = false;
    await sendTask(
      customer,
      model,
      dents,
      uploadedImages,
      specialCase,
      note,
      defaultLang,
    );
  });
}

// GENERAL, on all pages

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

// LOGIN, SIGNUP, PASSWORD RESET, ACCOUNT UPDATE

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
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
    const language = document.getElementById('language').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirm_password').value;
    const name = document.getElementById('company').value;
    signup(name, email, language, password, passwordConfirm);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const language = document.getElementById('language').value;
    updateSettings({ name, email, language }, 'Settings');
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

if (passwordResetForm) {
  passwordResetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const password = document.getElementById('password-reset').value;
    const passwordConfirm = document.getElementById(
      'passwordConfirm-reset',
    ).value;

    resetPassword(password, passwordConfirm, token);
  });
}

if (forgotPassBtn) {
  forgotPassBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const email = document.getElementById('email-forgot-pass').value.trim();
    forgotPassword(email);
  });
}
