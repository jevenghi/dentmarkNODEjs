'use strict';

const buttonsBody = document.querySelectorAll('.button--body');
// const main = document.querySelector(".main-container");
const sideText = document.querySelector('.choose__side');

const imageContainer = document.querySelector('.image-container');
const imageContainerSummary = document.querySelector(
  '.image-container__summary'
);

const sendContainer = document.querySelector('.send-container');
const vehicleImage = document.getElementById('vehicleImage');
const saveMarksButton = document.querySelector('.save--marks');

const sendMarksBtn = document.querySelector('.send-marks');
const vehicleModel = document.querySelector('.form__input--model');
const customerName = document.querySelector('.form__input--name');
const customerEmail = document.querySelector('.form__input--email');

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
const buttonsPaint = document.querySelectorAll('.m_button--paint');

let sideSelection = document.querySelector('.sides-container');

class Vehicle {
  date = new Date();
  constructor(customer, model, body, dents) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.customer = customer;
    this.model = model;
    this.body = body;
    this.dents = dents || {};
    this.createdAt = this.date.toDateString();
  }
}
class App {
  #lineAngle;
  #shapePressed = false;
  #paintPressed = false;
  #distancePressed = false;
  #orientationPressed = false;
  #storedCoordinates;
  #bodyType;
  #bodySide;
  #dents = {};

  #dentLength;
  #dentShape;
  #dentPaintDamaged;
  constructor() {
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

            button.style.background =
              'linear-gradient(to right, #e69c6a, #ca580c)';
            this.#bodySide = button.value;
            const vehicleImage = document.getElementById('vehicleImage');

            vehicleImage.src = `pics/sides_pics/${this.#bodySide}.png`;

            sendContainer.classList.remove('hidden');
            markerContainer.classList.remove('hidden');
            saveMarksContainer.classList.remove('hidden');
            setTimeout(function () {
              markerContainer.classList.add('visible');
            }, 50);

            const sideDents = this.#dents[this.#bodySide];

            if (sideDents && sideDents.length > 0) {
              sideDents.forEach((dent) => {
                this._placeMarker(
                  dent.shape,
                  dent.length,
                  dent.orientation,
                  dent.paintDamaged,
                  dent.coords,
                  imageContainer
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

    buttonsPaint.forEach((button) => {
      button.addEventListener('click', () => {
        buttonsPaint.forEach((btn) => btn.classList.remove('pressed'));

        button.classList.add('pressed');
        this.#dentPaintDamaged = button.id;

        this.#paintPressed = true;
      });
    });

    buttonsOrientation.forEach((button) => {
      button.addEventListener('click', () => {
        buttonsOrientation.forEach((btn) => btn.classList.remove('pressed'));

        button.classList.add('pressed');
        this.#orientationPressed = true;
        this.#lineAngle = button.id;
      });
    });

    vehicleImage.addEventListener('click', (event) => {
      event.preventDefault();
      this.#storedCoordinates = {
        x: (event.offsetX / vehicleImage.clientWidth) * 100,
        y: (event.offsetY / vehicleImage.clientHeight) * 100,
      };
      if (
        !this.#shapePressed ||
        !this.#paintPressed ||
        !this.#distancePressed
      ) {
        alert('Shape, Distance and Paint damage options should be selected');
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
        this.#dentShape,
        this.#dentLength,
        this.#lineAngle,
        this.#dentPaintDamaged,
        coords,
        imageContainer
      );

      const dentData = {
        shape: this.#dentShape,
        length: this.#dentLength,
        orientation: this.#orientationPressed ? this.#lineAngle : null,
        paintDamaged: this.#dentPaintDamaged,
        coords: this.#storedCoordinates,
      };

      if (!this.#dents[this.#bodySide]) {
        this.#dents[this.#bodySide] = [];
      }

      this.#dents[this.#bodySide].push(dentData);
    });

    sendMarksBtn.addEventListener('click', () => {
      const model = vehicleModel.value;
      const name = customerName.value;
      const email = customerEmail.value;
      if (!model || !name) {
        return alert('Please enter Model and your Name');
      } else {
        alert('Data sent!');
      }
      const veh = new Vehicle(name, model, this.#bodyType, this.#dents);
      console.log(veh);
      this._removeAllMarkers();

      Object.entries(veh.dents).forEach(([side, dents]) => {
        console.log(side);
        let html = `
          <div class="image-container__summary">
            <div class="overlay-text model-text">${veh.model}</div>
            <div class="overlay-text customer-text">${veh.customer}</div>
            <div class="overlay-text date-text">${veh.createdAt}</div>
            <img id="vehicleImage" src="pics/sides_pics/${side}.png" />
            <div id="marker"></div>
          </div>
        `;

        sendContainer.insertAdjacentHTML('afterend', html);

        dents.forEach((entry) => {
          const { shape, length, orientation, paintDamaged, coords } = entry;
          const imageContainerSummary = document.querySelector(
            '.image-container__summary'
          );
          this._placeMarker(
            shape,
            length,
            orientation,
            paintDamaged,
            coords,
            imageContainerSummary
          );
        });
      });

      // alert("Data sent successfully!");
      // window.scrollTo(0, 0);
      // setTimeout(() => {
      //   location.reload();
      // }, 50);
    });

    removeMarksBtn.addEventListener('click', () => {
      this._removeAllMarkers();
      this.#dents = {};
    });

    removeLastMarkBtn.addEventListener('click', () => {
      this._removeLastMarker();
      this.#dents[this.#bodySide].pop();
      console.log(this.#dents);
    });
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

  _placeMarker(shape, length, orientationDent, paintDamaged, coords, image) {
    const marker = document.createElement('div');
    marker.className = 'marker';
    marker.style.left = `${coords.x - 1}%`;
    marker.style.top = `${coords.y - 3}%`;

    if (shape === 'line') {
      marker.style.width = '2rem';
      marker.style.borderRadius = '0.8rem';

      marker.style.transform = `rotate(${orientationDent})`;
    }

    if (paintDamaged === 'yes') {
      const markerX = document.createElement('span');
      markerX.textContent = 'X';
      marker.appendChild(markerX);
    }

    if (length === 'small') {
      marker.style.background = '#78fa7e';
    }
    if (length === 'medium') {
      marker.style.background = '#faf878';
    }
    if (length === 'big') {
      marker.style.background = '#e96f4b';
    }

    image.appendChild(marker);
  }
}
const app = new App();
