'use strict';
import { showAlert } from '../js/alerts.js';

const buttonsBody = document.querySelectorAll('.button--body');
const bodyContainer = document.querySelector('.body-container');
const sideText = document.querySelector('.choose__side');
const chooseBodyText = document.querySelector('.choose__body');
const arrowBody = document.querySelector('.arrow__body');
const arrowSide = document.querySelector('.arrow__side');

const myAccBtn = document.querySelector('.nav__el--myacc');
const logout = document.querySelector('.logout');
const modal = document.querySelector('.modal');
const modalLinks = document.querySelectorAll('.modal__link');

const imageContainer = document.querySelector('.image-container');
const imageContainerSummary = document.querySelector('.image-container__summary');

const sendContainer = document.querySelector('.send-container');
const vehicleImage = document.getElementById('vehicleImage');
const saveMarksButton = document.querySelector('.save--marks');
const removeMarksContainer = document.querySelector('.remove-container');

const sendMarksBtn = document.querySelector('.send-marks');
const vehicleModel = document.querySelector('.form__input--model');

const saveMarksContainer = document.querySelector('.save-marks-container');

const shapeContainer = document.querySelector('.row--shapes');
const orientationContainer = document.querySelector('.row--orientation');
const markerContainer = document.querySelector('.marker-container');
const markers = imageContainer.getElementsByClassName('marker');
const buttonsOrientation = document.querySelectorAll('.m_button--orientation');

const removeMarksBtn = document.querySelector('.remove--marks');
const removeLastMarkBtn = document.querySelector('.remove__last');

const buttonsDistance = document.querySelectorAll('.m_button--distance');
const buttonsShape = document.querySelectorAll('.m_button--shapes');
const paintDamagedCheck = document.getElementById('paint-damaged');
const overlay = document.querySelector('.overlay');

let sideSelection = document.querySelector('.sides-container');

const searchBar = document.querySelector('.search-bar');

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

class App {
  #lineAngle;
  #shapePressed = false;
  #distancePressed = false;
  #orientationPressed = false;
  #storedCoordinates;
  #bodyType;
  #bodySide;
  #dents = [];
  #dentsTemp = {};

  #dentLength;
  #dentShape;
  #dentPaintDamaged = false;
  constructor() {
    let customer;

    if (searchInput) {
      searchInput.addEventListener('input', async function () {
        const userInput = searchInput.value.trim();
        if (userInput.length > 0) {
          try {
            const response = await axios.get('/api/v1/users/suggestUser', {
              params: {
                q: userInput,
              },
            });
            displayResults(response.data);
          } catch (error) {
            console.error(error);
          }
        } else {
          clearResults();
        }
      });

      function displayResults(results) {
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
      }

      function clearResults() {
        while (searchResults.firstChild) {
          searchResults.removeChild(searchResults.firstChild);
        }
        searchResults.style.display = 'none';
      }

      searchResults.addEventListener('click', function (event) {
        if (event.target.tagName === 'A') {
          searchInput.value = customer = event.target.textContent;
          searchResults.style.display = 'none';
        }
      });

      document.addEventListener('click', function (event) {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
          searchResults.style.display = 'none';
        }
      });
    }

    chooseBodyText.addEventListener('click', () => {
      bodyContainer.style.display = bodyContainer.style.display === 'none' ? 'grid' : 'none';
      arrowBody.classList.toggle('rotate');
    });
    sideText.addEventListener('click', () => {
      sideSelection.style.display = sideSelection.style.display === 'none' ? 'grid' : 'none';
      arrowSide.classList.toggle('rotate');
    });
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('taskId');

    logout.addEventListener('click', this._logoutUser);
    overlay.addEventListener('click', this._closeModal);

    myAccBtn.addEventListener('click', () => {
      modal.classList.toggle('hidden');
      overlay.classList.toggle('hidden');
    });
    modalLinks.forEach((button) => {
      button.addEventListener('click', () => {
        this._closeModal();
      });
    });

    buttonsBody.forEach((button) => {
      button.addEventListener('click', () => {
        buttonsBody.forEach((btn) => {
          btn.style.background = 'white';
        });
        removeMarksContainer.classList.add('hidden');

        button.style.background = 'linear-gradient(to right, #e69c6a, #ca580c)';

        this.#bodyType = button.value;
        bodyContainer.style.display = 'none';
        arrowBody.classList.toggle('rotate');

        markerContainer.classList.add('hidden');
        sendContainer.classList.add('hidden');
        saveMarksContainer.classList.add('hidden');

        sideText.classList.remove('hidden');

        if (sideSelection) sideSelection.remove();
        if (vehicleImage) vehicleImage.src = '';

        this._renderVehicleImage(this.#bodyType);
        sideSelection = document.querySelector('.sides-container');
        setTimeout(function () {
          sideSelection.classList.add('visible');
        }, 50);

        const buttonsSide = document.querySelectorAll('.button--side');
        buttonsSide.forEach((button) => {
          button.addEventListener('click', () => {
            buttonsSide.forEach((btn) => {
              btn.style.border = 'none';
            });
            this._removeAllMarkers();
            this._customerFieldVisible();

            // sideSelection.style.display =
            //   sideSelection.style.display === 'none' ? 'grid' : 'none';
            // arrowSide.classList.toggle('rotate');

            this.#shapePressed = false;
            this.#distancePressed = false;
            this.#orientationPressed = false;
            paintDamagedCheck.checked = false;
            this.#dentPaintDamaged = false;

            buttonsShape.forEach((btn) => btn.classList.remove('pressed'));
            buttonsDistance.forEach((btn) => btn.classList.remove('pressed'));
            buttonsOrientation.forEach((btn) => btn.classList.remove('pressed'));
            orientationContainer.classList.add('hidden');

            // button.style.background =
            //   'linear-gradient(to right, #e69c6a, #ca580c)';
            button.style.border = '0.3rem solid coral';
            this.#bodySide = button.value;

            const vehicleImage = document.getElementById('vehicleImage');

            vehicleImage.src = `pics/sides_pics/${this.#bodySide}.png`;
            removeMarksContainer.classList.remove('hidden');

            sendContainer.classList.remove('hidden');
            markerContainer.classList.remove('hidden');
            saveMarksContainer.classList.remove('hidden');
            setTimeout(function () {
              markerContainer.classList.add('visible');
            }, 50);

            const sideDents = this.#dentsTemp[this.#bodySide];

            if (sideDents && sideDents.length > 0) {
              sideDents.forEach((dent) => {
                this._placeMarker(dent.img, dent.shape, dent.length, dent.orientation, dent.paintDamaged, dent.coords, imageContainer);
              });
            }
          });
        });
      });
    });

    buttonsDistance.forEach((button) => {
      button.addEventListener('click', () => {
        buttonsDistance.forEach((btn) => btn.classList.remove('pressed'));

        button.classList.add('pressed');
        this.#distancePressed = true;
        this.#dentLength = button.id;
      });
    });

    buttonsShape.forEach((button) => {
      button.addEventListener('click', () => {
        buttonsShape.forEach((btn) => btn.classList.remove('pressed'));

        button.classList.add('pressed');
        this.#shapePressed = true;
        this.#dentShape = button.id;
        if (this.#dentShape === 'line') {
          orientationContainer.classList.remove('hidden');
        } else {
          orientationContainer.classList.add('hidden');
        }
      });
    });

    paintDamagedCheck.addEventListener('click', () => {
      this.#dentPaintDamaged = this.#dentPaintDamaged ? false : true;
    });

    buttonsOrientation.forEach((button) => {
      button.addEventListener('click', () => {
        buttonsOrientation.forEach((btn) => btn.classList.remove('pressed'));

        button.classList.add('pressed');
        this.#orientationPressed = true;
        this.#lineAngle = button.id;
      });
    });

    const markers = {};
    vehicleImage.addEventListener('click', (event) => {
      event.preventDefault();
      // removeMarksContainer.style.display = 'flex';

      if (this.#dents.length > 100) {
        return alert('You can place maximum 100 markers per vehicle. We will take care of the rest on site');
      }

      //calculate the percentage values of the x, y relative to the width,
      //height of an image, so that x, y can be recreated on image of another size.
      this.#storedCoordinates = {
        x: (event.offsetX / vehicleImage.clientWidth) * 100,
        y: (event.offsetY / vehicleImage.clientHeight) * 100,
      };
      if (!this.#shapePressed || !this.#distancePressed) {
        alert('Shape and Distance options should be selected');
        return;
      }

      if (this.#dentShape === 'line') {
        if (!this.#orientationPressed) {
          alert('Choose the orientation of the dent');
          return;
        }
      }
      // const { x, y } = this.#storedCoordinates;
      const coords = this.#storedCoordinates;
      this._placeMarker(this.#bodySide, this.#dentShape, this.#dentLength, this.#lineAngle, this.#dentPaintDamaged, coords, imageContainer);

      const newObj = {
        img: this.#bodySide,
        shape: this.#dentShape,
        length: this.#dentLength,
        orientation: this.#orientationPressed ? this.#lineAngle : null,
        paintDamaged: this.#dentPaintDamaged,
        coords: this.#storedCoordinates,
        status: 'open',
      };

      this.#dents.push(newObj);

      if (!this.#dentsTemp[this.#bodySide]) {
        this.#dentsTemp[this.#bodySide] = [];
      }
      this.#dentsTemp[this.#bodySide].push(newObj);
      // let existingSide = this.#dents.find(
      //   (item) => Object.keys(item)[0] === this.#bodySide,
      // );
      // if (!existingSide) {
      //   this.#dents.push({ [this.#bodySide]: [newObj] });
      // } else {
      //   existingSide[this.#bodySide].push(newObj);
      // }
    });

    sendMarksBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (this.#dents.length === 0) return alert('You have not placed any dent yet');
      if (taskId) {
        await this._addDentsToTask(taskId, this.#dents);
      } else {
        const model = vehicleModel.value;
        if (!model) {
          return alert('Please enter model name');
        }
        document.querySelector('.send-marks').textContent = 'Sending task...';
        await this._sendTask(customer, model, this.#bodyType, this.#dents);
      }
      this._removeAllMarkers();
      document.querySelector('.send-marks').textContent = 'Send task';
    });

    removeMarksBtn.addEventListener('click', () => {
      const confirmed = confirm('Remove all markers?');
      if (confirmed) {
        this._removeAllMarkers();
        this.#dentsTemp = {};
        this.#dents = [];
      }
    });

    removeLastMarkBtn.addEventListener('click', () => {
      this._removeLastMarker();
      if (this.#dentsTemp[this.#bodySide]) {
        this.#dentsTemp[this.#bodySide].pop();
      }
      if (this.#dents) {
        this.#dents.pop();
      }
    });
  }

  _isFrontOrRear(side) {
    return side.slice(-2) === 'fr' || side.slice(-2) === 're';
  }

  async _addDentsToTask(taskId, dents) {
    try {
      const res = await axios({
        method: 'POST',
        url: `/api/v1/tasks/sendTask/${taskId}`,
        data: { dents },
      });
      if (res.data.status === 'success') {
        alert('Dents successfully added!');

        window.setTimeout(() => {
          window.scrollTo(0, 0);
          location.reload();
        }, 50);
      }
    } catch (err) {
      alert(err.response.data.message);
    }
  }
  async _sendTask(customer = null, carModel, bodyType, dents) {
    try {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/tasks/sendTask',
        data: { user: customer, carModel, bodyType, dents },
      });
      if (res.data.status === 'success') {
        // showAlert(
        //   'success',
        //   'Your task is sent successfully! We will contact you soon.',
        // );
        alert('Your task is sent successfully! We will contact you soon.');

        window.setTimeout(() => {
          window.scrollTo(0, 0);
          location.reload();
        }, 50);
      }
    } catch (err) {
      // showAlert('error', err.response.data.message);
      alert(err.response.data.message);
      // console.log(err.response);
      // alert(err.response.data.message);
    }
  }
  async _isAdmin() {
    try {
      const res = await axios({
        method: 'GET',
        url: `/api/v1/auth/isAdmin`,
      });
      return res.data;
    } catch (err) {
      alert(err);
      return false;
    }
  }
  async _customerFieldVisible() {
    const isAdmin = await this._isAdmin();

    if (isAdmin) searchBar.style.display = 'block';
  }
  async _lastMarkerNumber(taskId) {
    try {
      const res = await axios({
        method: 'GET',
        url: `/api/v1/tasks/${taskId}`,
      });
      return res.data.data.dents[res.data.data.dents.length - 1].markerNumber;
    } catch (err) {
      alert(err.response.data.message);
    }
  }

  _closeModal() {
    overlay.classList.add('hidden');
    modal.classList.add('hidden');
  }

  _removeAllMarkers() {
    if (markers.length > 0) {
      while (markers.length > 0) {
        imageContainer.removeChild(markers[0]);
      }
    }
  }
  _removeLastMarker() {
    if (markers.length > 0) {
      const lastMarker = markers[markers.length - 1];
      imageContainer.removeChild(lastMarker);
    }
  }

  _renderVehicleImage(bodyType) {
    let html = `
        <div class="sides-container">
          <button class="button button--side" value="${bodyType}rs">
            <img src="pics/sides_pics/${bodyType}rs.png" id="${bodyType}rs" />
          </button>
          <button class="button button--side" value="${bodyType}ls">
            <img src="pics/sides_pics/${bodyType}ls.png" id="${bodyType}ls" />
          </button>
          <button class="button button--side" value="${bodyType}top">
            <img src="pics/sides_pics/${bodyType}top.png" id="${bodyType}top" />
          </button>
          <button class="button button--side" value="${bodyType}re">
            <img src="pics/sides_pics/${bodyType}re.png" id="${bodyType}re" />
          </button>
          <button class="button button--side" value="${bodyType}fr">
            <img src="pics/sides_pics/${bodyType}fr.png" id="${bodyType}fr" />
          </button>
        </div>`;

    sideText.insertAdjacentHTML('afterend', html);
  }

  _placeMarker(side, shape, length, orientationDent, paintDamaged, coords, image) {
    const marker = document.createElement('div');
    marker.className = 'marker';

    if (paintDamaged) {
      const markerX = document.createElement('span');
      markerX.textContent = 'X';
      marker.appendChild(markerX);
    }

    if (length === 'small') {
      if (shape === 'nonagon') {
        this._markerStyle('nonagon', marker, side, coords, null, '1.3rem', '0.5rem', '1.3rem', '0.5rem', 2, 0.8, 2.6, 2.6);
      } else if (shape === 'line') {
        this._markerStyle('line', marker, side, coords, orientationDent, '1.5rem', '0.8rem', '0.6rem', '0.3rem', 2, 1, 1.5, 1.8);
      }
    }

    if (length === 'medium') {
      if (shape === 'nonagon') {
        this._markerStyle('nonagon', marker, side, coords, null, '2rem', '0.8rem', '2rem', '0.8rem', 2.6, 1, 3.6, 3);
      } else if (shape === 'line') {
        this._markerStyle('line', marker, side, coords, orientationDent, '2.2rem', '1.4rem', '0.8rem', '0.5rem', 3.2, 2, 1.8, 2.6);
      }
    }

    if (length === 'big') {
      if (shape === 'nonagon') {
        this._markerStyle('nonagon', marker, side, coords, null, '2.6rem', '1.6rem', '2.6rem', '1.6rem', 3.4, 2, 5, 5.3);
      } else if (shape === 'line') {
        this._markerStyle('line', marker, side, coords, orientationDent, '2.9rem', '2.2rem', '1.2rem', '0.8rem', 3.8, 3.2, 2.5, 4.2);
      }
    }

    image.appendChild(marker);
  }

  _circleMarkerStyle(marker, side, coords, w1, w2, x1, x2, y1, y2) {
    marker.style.width = marker.style.height = this._isFrontOrRear(side) ? w1 : w2;
    marker.style.left = this._isFrontOrRear(side) ? `${coords.x - x1}%` : `${coords.x - x2}%`;
    marker.style.top = this._isFrontOrRear(side) ? `${coords.y - y1}%` : `${coords.y - y2}%`;
  }

  _markerStyle(shape, marker, side, coords, orientationDent, w1, w2, h1, h2, x1, x2, y1, y2) {
    marker.style.width = this._isFrontOrRear(side) ? w1 : w2;
    marker.style.height = this._isFrontOrRear(side) ? h1 : h2;

    marker.style.left = this._isFrontOrRear(side) ? `${coords.x - x1}%` : `${coords.x - x2}%`;
    marker.style.top = this._isFrontOrRear(side) ? `${coords.y - y1}%` : `${coords.y - y2}%`;
    if (shape === 'line') {
      marker.style.borderRadius = '0.8rem';
      marker.style.transform = `rotate(${orientationDent})`;
    }
  }

  _logoutUser() {
    fetch('/api/v1/users/logout', {
      method: 'GET',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error logging out!');
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          location.reload(true);
          // window.location.href = 'landing.html';
        } else {
          throw new Error('Error logging out!');
        }
      })
      .catch((error) => {
        console.error(error);
        alert('Error logging out! Try again.');
      });
  }
}
const app = new App();
