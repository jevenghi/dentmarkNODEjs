'use strict';
import { showAlert } from '../js/alerts.js';

const buttonsBody = document.querySelectorAll('.button--body');
// const main = document.querySelector(".main-container");
const sideText = document.querySelector('.choose__side');
const myAccBtn = document.querySelector('.nav__el--myacc');
const logout = document.querySelector('.logout');
const modal = document.querySelector('.modal');
const modalLinks = document.querySelectorAll('.modal__link');

const imageContainer = document.querySelector('.image-container');
const imageContainerSummary = document.querySelector(
  '.image-container__summary',
);

const sendContainer = document.querySelector('.send-container');
const vehicleImage = document.getElementById('vehicleImage');
const saveMarksButton = document.querySelector('.save--marks');

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

class Vehicle {
  constructor(carModel, bodyType, dents) {
    this.carModel = carModel;
    this.bodyType = bodyType;
    // this.difficulty = difficulty;
    this.dents = dents || {};
    this.createdAt = new Date();
  }
}
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

  #markerCount;

  #dentLength;
  #dentShape;
  #dentPaintDamaged = false;
  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('taskId');
    if (taskId) {
      this._lastMarkerNumber(taskId)
        .then((lastNum) => {
          this.#markerCount = lastNum;
        })
        .catch((err) => {
          console.error('Error:', err);
        });
    } else {
      this.#markerCount = 0;
    }

    logout.addEventListener('click', this._logoutUser);
    overlay.addEventListener('click', this._closeModal);

    myAccBtn.addEventListener('click', () => {
      modal.classList.toggle('hidden');
      overlay.classList.toggle('hidden');

      // modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
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

        button.style.background = 'linear-gradient(to right, #e69c6a, #ca580c)';

        this.#bodyType = button.value;

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
              btn.style.background = 'white';
            });
            this._removeAllMarkers();

            this.#shapePressed = false;
            this.#distancePressed = false;
            this.#orientationPressed = false;
            paintDamagedCheck.checked = false;
            this.#dentPaintDamaged = false;

            buttonsShape.forEach((btn) => btn.classList.remove('pressed'));
            buttonsDistance.forEach((btn) => btn.classList.remove('pressed'));
            buttonsOrientation.forEach((btn) =>
              btn.classList.remove('pressed'),
            );
            orientationContainer.classList.add('hidden');

            button.style.background =
              'linear-gradient(to right, #e69c6a, #ca580c)';
            this.#bodySide = button.value;
            // console.log(
            //   this.isRear(this.#bodySide) || this.isFront(this.#bodySide),
            // );
            const vehicleImage = document.getElementById('vehicleImage');

            vehicleImage.src = `pics/sides_pics/${this.#bodySide}.png`;

            sendContainer.classList.remove('hidden');
            markerContainer.classList.remove('hidden');
            saveMarksContainer.classList.remove('hidden');
            setTimeout(function () {
              markerContainer.classList.add('visible');
            }, 50);

            const sideDents = this.#dentsTemp[this.#bodySide];

            if (sideDents && sideDents.length > 0) {
              sideDents.forEach((dent) => {
                this._placeMarker(
                  dent.img,
                  dent.shape,
                  dent.length,
                  dent.orientation,
                  dent.paintDamaged,
                  dent.coords,
                  imageContainer,
                );
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
      if (this.#dents.length > 50) {
        return alert(
          'You can place maximum 50 markers per vehicle. We will take care of the rest on site',
        );
      }

      this.#markerCount++;
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
      this._placeMarker(
        this.#bodySide,
        this.#dentShape,
        this.#dentLength,
        this.#lineAngle,
        this.#dentPaintDamaged,
        coords,
        imageContainer,
      );

      // const dentData = {
      //   shape: this.#dentShape,
      //   length: this.#dentLength,
      //   orientation: this.#orientationPressed ? this.#lineAngle : null,
      //   paintDamaged: this.#dentPaintDamaged,
      //   coords: this.#storedCoordinates,
      //   cost: 0,
      //   markerNumber: this.#markerCount,
      //   status: 'open',
      //   id: uniqueId(),
      // };

      // if (!this.#dents[this.#bodySide]) {
      //   this.#dents[this.#bodySide] = [];
      // }

      // this.#dents[this.#bodySide].push(dentData);

      const newObj = {
        img: this.#bodySide,
        shape: this.#dentShape,
        length: this.#dentLength,
        orientation: this.#orientationPressed ? this.#lineAngle : null,
        paintDamaged: this.#dentPaintDamaged,
        coords: this.#storedCoordinates,
        markerNumber: this.#markerCount,
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
      if (this.#dents.length === 0)
        return alert('You have not placed any dent yet');
      if (taskId) {
        await this._addDentsToTask(taskId, this.#dents);
      } else {
        const model = vehicleModel.value;
        if (!model) {
          return alert('Please enter model name');
        }
        document.querySelector('.send-marks').textContent = 'Sending task...';
        await this._sendTask(model, this.#bodyType, this.#dents);
      }
      this._removeAllMarkers();
      this.#markerCount = 0;
      document.querySelector('.send-marks').textContent = 'Send task';

      // window.scrollTo(0, 0);
      // setTimeout(() => {
      //   location.reload();
      // }, 50);

      // fetch('http://127.0.0.1:5501/api/v1/tasks/sendTask', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(veh),
      // })
      //   .then((response) => {
      //     if (!response.ok) {
      //       throw new Error('Network response was not ok');
      //     }
      //     return response.json();
      //   })
      //   .then(() => {
      //     alert('Your task is sent successfully! We will contact you soon.');
      //   })
      //   .catch((error) => {
      //     console.error('Error sending data:', error);
      //   });

      //TASK RECREATE
      // Object.entries(veh.dents).forEach(([side, dents]) => {
      //   let html = `
      //     <div class="image-container__summary">
      //       <div class="overlay-text model-text">${veh.carModel}</div>
      //       <div class="overlay-text customer-text">${veh.user}</div>
      //       <div class="overlay-text date-text">${veh.createdAt}</div>
      //       <img id="vehicleImage" src="pics/sides_pics/${side}.png" />
      //       <div id="marker"></div>
      //     </div>
      //   `;

      //   sendContainer.insertAdjacentHTML('afterend', html);

      //   dents.forEach((entry) => {
      //     const { shape, length, orientation, paintDamaged, coords } = entry;
      //     const imageContainerSummary = document.querySelector(
      //       '.image-container__summary',
      //     );
      //     this._placeMarker(
      //       shape,
      //       length,
      //       orientation,
      //       paintDamaged,
      //       coords,
      //       imageContainerSummary,
      //     );
      //   });
      // });

      // window.scrollTo(0, 0);
      // setTimeout(() => {
      //   location.reload();
      // }, 50);
    });

    removeMarksBtn.addEventListener('click', () => {
      this._removeAllMarkers();
      this.#dentsTemp = {};
      this.#dents = [];
    });

    removeLastMarkBtn.addEventListener('click', () => {
      this._removeLastMarker();
      this.#dentsTemp[this.#bodySide].pop();
      this.#dents.pop();
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
  async _sendTask(carModel, bodyType, dents) {
    try {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/tasks/sendTask',
        data: { carModel, bodyType, dents },
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

  //   fetch('http://127.0.0.1:5501/api/v1/tasks/sendTask', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(obj),
  //   })
  //     .then((res) => {
  //       if (res.status === 201) {
  //         console.log(res.json());
  //         alert('Your task is sent successfully! We will contact you soon.');
  //       } else {
  //         console.log(res);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error sending data:', error);
  //     });
  // }
  async _lastMarkerNumber(taskId) {
    try {
      const res = await axios({
        method: 'GET',
        url: `/api/v1/tasks/${taskId}`,
      });
      // const lastNum = await task.dents[task.dents.length - 1];
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
          <button class="button button--side" value="${bodyType}fr">
            <img src="pics/sides_pics/${bodyType}fr.png" id="${bodyType}fr" />
          </button>
          <button class="button button--side" value="${bodyType}re">
            <img src="pics/sides_pics/${bodyType}re.png" id="${bodyType}re" />
          </button>
          <button class="button button--side" value="${bodyType}top">
            <img src="pics/sides_pics/${bodyType}top.png" id="${bodyType}top" />
          </button>
        </div>`;

    sideText.insertAdjacentHTML('afterend', html);
  }

  _placeMarker(
    side,
    shape,
    length,
    orientationDent,
    paintDamaged,
    coords,
    image,
  ) {
    const marker = document.createElement('div');
    marker.className = 'marker';
    marker.style.left = this._isFrontOrRear(side)
      ? `${coords.x - 4}%`
      : `${coords.x - 1}%`;
    marker.style.top = this._isFrontOrRear(side)
      ? `${coords.y - 3.5}%`
      : `${coords.y - 3}%`;

    // if (shape === 'line') {
    //   marker.style.width = '1rem';
    //   marker.style.borderRadius = '0.8rem';

    //   marker.style.transform = `rotate(${orientationDent})`;
    // }

    if (paintDamaged) {
      const markerX = document.createElement('span');
      markerX.textContent = 'X';
      marker.appendChild(markerX);
    }

    if (length === 'small') {
      // marker.style.background = '#FF5722';
      if (shape === 'nonagon') {
        marker.style.width = this._isFrontOrRear(side) ? '1.3rem' : '0.5rem';
        marker.style.height = this._isFrontOrRear(side) ? '1.3rem' : '0.5rem';
      } else if (shape === 'line') {
        marker.style.width = this._isFrontOrRear(side) ? '1.5rem' : '0.8rem';
        marker.style.height = this._isFrontOrRear(side) ? '0.6rem' : '0.3rem';
        marker.style.borderRadius = '0.8rem';
        marker.style.transform = `rotate(${orientationDent})`;
      }
    }
    if (length === 'medium') {
      // marker.style.background = '#FF5722';
      if (shape === 'nonagon') {
        marker.style.width = this._isFrontOrRear(side) ? '2rem' : '0.8rem';
        marker.style.height = this._isFrontOrRear(side) ? '2rem' : '0.8rem';
      } else if (shape === 'line') {
        marker.style.width = this._isFrontOrRear(side) ? '2.2rem' : '1.4rem';
        marker.style.height = this._isFrontOrRear(side) ? '0.8rem' : '0.5rem';
        marker.style.borderRadius = '0.8rem';
        marker.style.transform = `rotate(${orientationDent})`;
      }
    }
    if (length === 'big') {
      // marker.style.background = '#FF5722';
      if (shape === 'nonagon') {
        marker.style.width = this._isFrontOrRear(side) ? '2.6rem' : '1.6rem';
        marker.style.height = this._isFrontOrRear(side) ? '2.6rem' : '1.6rem';
      } else if (shape === 'line') {
        marker.style.width = this._isFrontOrRear(side) ? '2.9rem' : '2.2rem';
        marker.style.height = this._isFrontOrRear(side) ? '1.2rem' : '0.8rem';
        marker.style.borderRadius = '0.8rem';
        marker.style.transform = `rotate(${orientationDent})`;
      }
    }

    image.appendChild(marker);
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
