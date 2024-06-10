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
  // populateSidesWithDents,
} from './placeMarker';
import { resetPassword } from './resetPassword';
import {
  uploadPhotosTemp,
  renderVehicleImageFromUploads,
  getImagesAndDents,
} from './photosHandler';
import { sendTask } from './sendTask';
import { searchUsers, getUserLanguagePref } from './searchUsers';
import { generateTaskPDF, createShortcutContainer } from './makeScreenshot';
import { UPLOADED_IMAGE_WIDTH } from '../../constants/markerConstants';
import { translations } from './translations';
const events = require('events');
events.EventEmitter.setMaxListeners = 20;

// const imageCanvas =
const mainContainer = document.querySelector('.main-container');
const passwordResetForm = document.querySelector('.reset-form');
const uploadPhoto = document.querySelector('.upload_photo');
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
const costInputs = document.querySelectorAll('.dent-cost');
const totalCostInput = document.querySelector('.total-cost');
const remarkInput = document.querySelector('.task-remark');

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
const logoImage = document.getElementById('logoImage');
const logoContainer = document.querySelector('.logo-container');
const paginationBtns = document.querySelector('.pagination-buttons');
const filterOptions = document.querySelector('.filter-menu');
const forgotPassBtn = document.getElementById('forgot-pass');
// const vehicleImage = document.getElementById('vehicleImage');
// const vehicleImages = document.querySelectorAll('#vehicleImage');
const sideText = document.querySelector('.choose__side');

const markerContainer = document.querySelector('.marker-container');
const addDents = document.querySelector('.add-dents');

const paintDamagedCheck = document.getElementById('paint-damaged');
const specialCaseCheck = document.getElementById('special-case');
const bigDentCheck = document.getElementById('big-dent');

// let buttonsSide = document.querySelectorAll('.button--side');
const sidesContainer = document.querySelector('.sides-container');
const markerParameters = document.querySelector('.choose-marker');
const addAnotherSide = document.querySelector('.choose__side');
const arrowParams = document.querySelector('.arrow__params');
const arrowSide = document.querySelector('.arrow__side');
const imageContainer = document.querySelector('.image-container');

const searchBar = document.querySelector('.search-bar');

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const selectedYear = document.getElementById('year');
const taskHeader = document.querySelector('.task-header');
const addNewDentsToTask = document.querySelector('.save-new-dents');
let buttonsSide = document.querySelectorAll('.button--side');

let url = new URL(window.location.href);
let defaultLang = 'en';
// function getMarkers() {
//   return document.querySelectorAll('.marker');
// }
// let markers = getMarkers();

// if (addAnotherSide) {
//   addAnotherSide.addEventListener('click', () => {
//     arrowSide.classList.toggle('rotate');
//     sidesContainer.style.display =
//       sidesContainer.style.display === 'none' ? 'grid' : 'none';
//   });
// }
document.addEventListener('DOMContentLoaded', async () => {
  const elementsToTranslate = document.querySelectorAll('[data-key]');

  defaultLang = await getUserLanguagePref();

  setLanguage(defaultLang);

  function setLanguage(language) {
    elementsToTranslate.forEach((element) => {
      const key = element.getAttribute('data-key');
      element.textContent = translations[language][key];
    });
  }
});

// const fileInput = document.getElementById('photo');
// if (fileInput) {
//   fileInput.addEventListener('change', function () {
//     if (fileInput.files.length > 0) {
//       uploadPhoto.classList.remove('hidden');
//     }
//   });
// }

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

window.addEventListener('beforeunload', function (event) {
  if (uploadedImages.length > 0 && dents.length > 0 && warnBeforeUnload) {
    const confirmationMessage =
      'You have unsaved changes. Are you sure you want to leave this page?';
    event.preventDefault();
    event.returnValue = confirmationMessage;
    return confirmationMessage;
  }
});

const removeAllMarkers = (markers) => {
  if (markers.length > 0) {
    while (markers.length > 0) {
      imageContainer.removeChild(markers[0]);
    }
  }
};

const populateSidesWithDents = (dents, folder) => {
  const imageContainer = document.querySelector('.image-container');

  const markers = imageContainer.getElementsByClassName('marker');
  const buttonsSide = document.querySelectorAll('.button--side');
  buttonsSide.forEach((button) => {
    button.addEventListener('click', () => {
      buttonsSide.forEach((btn) => {
        btn.style.border = 'none';
      });

      removeAllMarkers(markers);
      const addNewDentsToTask = document.querySelector('.save-new-dents');

      button.style.border = '0.3rem solid coral';
      img = button.value;
      let vehicleImage = document.getElementById('vehicleImage');
      vehicleImage.style.width = UPLOADED_IMAGE_WIDTH;
      vehicleImage.src = `/pics/tasks/${img}`;
      vehicleImage.setAttribute('data-image-id', img);

      removeMarksContainer.classList.remove('hidden');
      if (addNewDentsToTask) addNewDentsToTask.classList.remove('hidden');
      // sendMarksBtn.classList.remove('hidden');
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

      const sideDents = dents[img];
      if (sideDents && sideDents.length > 0) {
        sideDents.forEach((dent) => {
          placeMarker(
            dent.bigDent,
            dent.paintDamaged,
            dent.coords,
            imageContainer,
          );
        });
      }
    });
  });
};

// const makeMarkerContainerFloating = () => {
//   const sentinel = document.querySelector('.sentinel');
//   const markerContainerHeight = markerContainer.getBoundingClientRect().height;
//   const markerContainerPlaceholder = document.querySelector(
//     '.marker-container-placeholder',
//   );

//   markerContainerPlaceholder.style.height = `${markerContainerHeight}px`;

//   const observer = new IntersectionObserver(
//     (entries) => {
//       entries.forEach((entry) => {
//         if (entry.intersectionRatio === 0) {
//           markerContainer.classList.add('sticky');
//           markerContainerPlaceholder.classList.add('visible');
//         } else {
//           markerContainer.classList.remove('sticky');
//           markerContainerPlaceholder.classList.remove('visible');
//         }
//       });
//     },
//     {
//       root: null,
//       threshold: 0,
//       rootMargin: `+${markerContainerHeight}px`,
//     },
//   );

//   observer.observe(sentinel);
//   // const markerContainerOffset =
//   //   markerContainer.offsetTop + markerContainer.offsetHeight;

//   // window.addEventListener('scroll', () => {
//   //   if (window.scrollY > markerContainerOffset) {
//   //     markerContainer.classList.add('sticky');
//   //   } else {
//   //     markerContainer.classList.remove('sticky');
//   //   }
//   // });
// };
const makeMarkerContainerFloating = () => {
  const sentinel = document.querySelector('.sentinel');
  const markerContainer = document.querySelector('.marker-container');
  const markerContainerHeight = markerContainer.getBoundingClientRect().height;
  const markerContainerPlaceholder = document.querySelector(
    '.marker-container-placeholder',
  );

  markerContainerPlaceholder.style.height = `${markerContainerHeight}px`;

  let lastScrollY = window.scrollY;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const currentScrollY = window.scrollY;

        if (entry.intersectionRatio === 0 && currentScrollY > lastScrollY) {
          markerContainer.classList.add('sticky');
          markerContainerPlaceholder.classList.add('visible');
        } else if (
          entry.intersectionRatio > 0 ||
          currentScrollY < lastScrollY
        ) {
          markerContainer.classList.remove('sticky');
          markerContainerPlaceholder.classList.remove('visible');
        }

        lastScrollY = currentScrollY;
      });
    },
    {
      root: null,
      threshold: 0,
      rootMargin: `+${markerContainerHeight}px`,
    },
  );

  observer.observe(sentinel);
};

const removeLastMarker = (markers, dents) => {
  if (markers.length > 0) {
    const lastMarker = markers[markers.length - 1];
    imageContainer.removeChild(lastMarker);
  }
  if (dents) dents.pop();
};

async function loadDataAndPopulate(taskId) {
  try {
    const { images, groupedDents } = await getImagesAndDents(taskId);
    populateSidesWithDents(groupedDents);
    uploadedImages = images;
    dentsTemp = groupedDents;
  } catch (error) {
    console.error(error);
    showAlert('error', error);
  }
}

const displayResults = (results) => {
  clearResults();

  if (results.length > 0) {
    results.forEach(function (result) {
      const link = document.createElement('a');
      link.textContent = result;
      searchResults.appendChild(link);
    });
    searchResults.style.display = 'block';
  } else {
    searchResults.style.display = 'none';
  }
};
const clearResults = () => {
  while (searchResults.firstChild) {
    searchResults.removeChild(searchResults.firstChild);
  }
  searchResults.style.display = 'none';
};

if (uploadPhoto) {
  if (removeLastMarkBtn) {
    const markers = imageContainer.getElementsByClassName('marker');
    removeLastMarkBtn.addEventListener('click', () => {
      removeLastMarker(markers, dents);
      if (dentsTemp[img]) dentsTemp[img].pop();
    });
    removeMarksBtn.addEventListener('click', () => {
      const confirmed = confirm(translations[defaultLang]['removeAllMarks']);

      // const confirmed = confirm('Remove all markers?');
      if (confirmed) {
        removeAllMarkers(markers);
        dents = dents.filter((element) => element.imageId !== img);
        if (dentsTemp[img]) delete dentsTemp[img];
        // dents = [];
        // dentsTemp = {};
      }
    });
    deleteImage.addEventListener('click', (e) => {
      const confirmed = confirm(translations[defaultLang]['deleteImage']);
      if (confirmed) {
        markerContainer.classList.add('hidden');
        // uploadPhoto.classList.remove('hidden');
        uploadedImages = uploadedImages.filter((element) => element !== img);
        dents = dents.filter((element) => element.imageId !== img);
        if (dentsTemp[img]) delete dentsTemp[img];
        if (vehicleImage) vehicleImage.src = '';
        renderVehicleImageFromUploads(uploadedImages);

        populateSidesWithDents(dentsTemp);
        sideSelection = document.querySelector('.sides-container');

        setTimeout(function () {
          sideSelection.classList.add('visible');
        }, 50);
        if (sendContainer) sendContainer.classList.add('hidden');
        if (sendMarksBtn) sendMarksBtn.classList.add('hidden');
        // if (uploadedImages.length === 0) sideText.classList.add('hidden');
      }
    });
  }
  if (markerContainer) {
    // const markerContainerOffset =
    //   markerContainer.offsetTop + markerContainer.offsetHeight;

    // window.addEventListener('scroll', () => {
    //   if (window.scrollY > markerContainerOffset) {
    //     markerContainer.classList.add('sticky');
    //   } else {
    //     markerContainer.classList.remove('sticky');
    //   }
    // });

    paintDamagedCheck.addEventListener('click', () => {
      dentPaintDamaged = dentPaintDamaged ? false : true;
    });
    bigDentCheck.addEventListener('click', () => {
      bigDent = bigDent ? false : true;
    });
    specialCaseCheck.addEventListener('click', () => {
      specialCase = specialCase ? false : true;
    });
  }

  if (taskHeader) {
    taskId = taskHeader.dataset.taskId;
    loadDataAndPopulate(taskId);
    if (downloadTaskBtn) {
      downloadTaskBtn.addEventListener('click', async function () {
        downloadTaskBtn.disabled = true;
        const screenshotContainers = createShortcutContainer(uploadedImages);
        backToTasks.insertAdjacentHTML('afterend', screenshotContainers);
        let imagesToCapture = document.querySelectorAll(
          '.screenshot-container',
        );
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
  }

  uploadPhoto.addEventListener('click', async (e) => {
    e.preventDefault();

    const vehicleImage = imageContainer.querySelector('#vehicleImage');
    if (vehicleImage) vehicleImage.src = '';
    const form = new FormData();
    const images = document.getElementById('photo').files;
    if (images.length === 0)
      return showAlert('error', translations[defaultLang]['noFilesChosen']);
    if (logoImage) {
      logoImage.src = '';
      logoImage.style.width = 0;
    }
    uploadPhoto.textContent = 'Uploading...';

    Array.from(images).forEach((file) => {
      form.append('images', file);
    });

    try {
      const imagesProcessed = await uploadPhotosTemp(form);
      uploadedImages.push(...imagesProcessed);
    } catch (error) {
      showAlert('error', error);
    }
    uploadPhoto.textContent = 'Upload';
    renderVehicleImageFromUploads(uploadedImages, 'tasks');
    // uploadPhoto.classList.add('hidden');
    const fileInput = document.getElementById('photo');
    fileInput.value = '';

    sideText.classList.remove('hidden');
    sideSelection = document.querySelector('.sides-container');

    setTimeout(function () {
      sideSelection.classList.add('visible');
    }, 50);
    buttonsSide = document.querySelectorAll('.button--side');
    const markers = imageContainer.getElementsByClassName('marker');

    buttonsSide.forEach((button) => {
      button.addEventListener('click', () => {
        buttonsSide.forEach((btn) => {
          btn.style.border = 'none';
        });
        if (markers.length > 0) {
          while (markers.length > 0) {
            imageContainer.removeChild(markers[0]);
          }
        }

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
            );
          });
        }
      });
    });
  });

  vehicleImage.addEventListener('click', (event) => {
    event.preventDefault();
    const imageId = vehicleImage.dataset.imageId;
    const imageRect = vehicleImage.getBoundingClientRect();

    storedCoordinates = {
      x: event.offsetX,
      y: event.offsetY,
      relativeX: ((event.clientX - imageRect.left) / imageRect.width) * 100,
      relativeY: ((event.clientY - imageRect.top) / imageRect.height) * 100,
    };
    const coords = storedCoordinates;
    placeMarker(bigDent, dentPaintDamaged, coords, imageContainer);
    const newObj = {
      imageId: imageId,
      paintDamaged: dentPaintDamaged,
      bigDent: bigDent,
      coords: storedCoordinates,
      status: 'open',
    };
    dents.push(newObj);
    if (!dentsTemp[imageId]) {
      dentsTemp[imageId] = [];
    }
    dentsTemp[imageId].push(newObj);
  });

  if (searchInput) {
    searchInput.addEventListener('input', async function () {
      const userInput = searchInput.value.trim();
      if (userInput.length > 0) {
        try {
          const response = await searchUsers(userInput);
          displayResults(response);
        } catch (error) {
          showAlert('error', error);
        }
      } else {
        clearResults();
      }
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
  if (addNewDentsToTask) {
    addNewDentsToTask.addEventListener('click', async () => {
      // if (dents.length === 0)
      //   return showAlert('error', `You haven't added any dent`);
      warnBeforeUnload = false;

      addNewDentsToTask.textContent = 'Saving...';
      await addDentsToTask(taskId, dents, uploadedImages);
      addNewDentsToTask.textContent = 'Save changes';
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
}

if (forgotPassBtn) {
  forgotPassBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const email = document.getElementById('email-forgot-pass').value.trim();
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
    const language = document.getElementById('language').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirm_password').value;
    const name = document.getElementById('company').value;
    signup(name, email, language, password, passwordConfirm);
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
        updateTask(taskId, { taskStatus, dentId, cost });
      } else {
        updateTask(taskId, { dentId, cost });
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

if (backToTasks) {
  backToTasks.addEventListener('click', function () {
    window.location.href = '/tasks';
  });
}

if (deleteTaskBtn) {
  deleteTaskBtn.addEventListener('click', function () {
    const confirmed = confirm('Delete this task?');
    if (confirmed) {
      const taskId = deleteTaskBtn.dataset.taskId;
      deleteTask(taskId);
    }
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
