import { showAlert } from './alerts.js';
import axios from 'axios';
import { translations } from './translations';

const t = (key) =>
  translations[document.documentElement.lang || 'en']?.[key] ||
  translations.en[key];

export class TaskHandler {
  #bigDent = false;
  #specialCase = false;
  #dentPaintDamaged = false;
  #dents = [];
  #img;
  #storedCoordinates;
  #customer;
  constructor(dentsTemp = {}, uploadedImages = []) {
    this.dentsTemp = dentsTemp;
    this.uploadedImages = uploadedImages;

    uploadPhoto.addEventListener('click', async (e) => {
      e.preventDefault();
      const vehicleImage = imageContainer.querySelector('#vehicleImage');
      if (vehicleImage) vehicleImage.src = '';
      const form = new FormData();
      const images = document.getElementById('photo').files;
      if (images.length === 0)
        return showAlert('error', t('noFilesChosenUpload'));
      uploadPhoto.textContent = t('uploading');

      Array.from(images).forEach((file) => {
        form.append('images', file);
      });

      try {
        const imagesProcessed = await this.uploadPhotosTemp(form);
        uploadedImages.push(...imagesProcessed);
      } catch (error) {
        showAlert('error', error);
      }
      uploadPhoto.textContent = t('upload');
      this.renderVehicleImageFromUploads(uploadedImages, 'tasks');

      sideText.classList.remove('hidden');
      sideSelection = document.querySelector('.sides-container');

      setTimeout(function () {
        sideSelection.classList.add('visible');
      }, 50);
      //   const buttonsSide = document.querySelectorAll('.button--side');
      //   const markers = imageContainer.getElementsByClassName('marker');

      //   buttonsSide.forEach((button) => {
      //     button.addEventListener('click', () => {
      //       buttonsSide.forEach((btn) => {
      //         btn.style.border = 'none';
      //       });
      //       if (markers.length > 0) {
      //         while (markers.length > 0) {
      //           imageContainer.removeChild(markers[0]);
      //         }
      //       }

      //       button.style.border = '0.3rem solid coral';
      //       img = button.value;
      //       let vehicleImage = document.getElementById('vehicleImage');
      //       vehicleImage.style.width = '1000px';
      //       vehicleImage.src = `pics/tasks/${img}`;

      //       removeMarksContainer.classList.remove('hidden');
      //       sendMarksBtn.classList.remove('hidden');
      //       paintDamagedCheck.checked = false;
      //       bigDentCheck.checked = false;
      //       dentPaintDamaged = false;
      //       bigDent = false;

      //       sendContainer.classList.remove('hidden');
      //       markerContainer.classList.remove('hidden');
      //       setTimeout(function () {
      //         markerContainer.classList.add('visible');
      //       }, 50);
      //       const searchBar = document.querySelector('.search-bar');
      //       if (searchBar) searchBar.classList.remove('hidden');

      //       const sideDents = dentsTemp[img];
      //       if (sideDents && sideDents.length > 0) {
      //         sideDents.forEach((dent) => {
      //           placeMarker(
      //             dent.bigDent,
      //             dent.paintDamaged,
      //             dent.coords,
      //             imageContainer,
      //           );
      //         });
      //       }
      //     });
      //   });
    });
  }
  async uploadPhotosTemp(images) {
    try {
      const res = await axios({
        method: 'POST',
        url: `/api/v1/photos/uploadPhotos`,
        data: images,
      });
      if (res.data.status === 'success') {
        return res.data.imageNames;
      }
    } catch (err) {
      const message =
        err.response.data.message === 'Unexpected field'
          ? t('uploadLimit')
          : err.response.data.message;
      showAlert('error', message);
    }
  }

  renderVehicleImageFromUploads(uploadedImages, folder) {
    const sidesContainer = document.querySelector('.sides-container');
    const sideText = document.querySelector('.choose__side');

    if (sidesContainer) sidesContainer.remove();
    let html = '<div class="sides-container">';
    uploadedImages.forEach((image) => {
      html += `
              <button class="button button--side" value="${image}">
                  <img src="/pics/${folder}/${image}" id="${image}" />
              </button>`;
    });
    html += '</div>';
    sideText.insertAdjacentHTML('afterend', html);
  }
}
