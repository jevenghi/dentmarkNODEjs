import { showAlert } from './alerts.js';
import axios from 'axios';

export const uploadPhotosTemp = async (images) => {
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
    console.error(err);
  }
};

export const renderVehicleImageFromUploads = (uploadedImages) => {
  const sidesContainer = document.querySelector('.sides-container');
  const sideText = document.querySelector('.choose__side');

  if (sidesContainer) sidesContainer.remove();
  let html = '<div class="sides-container">';
  uploadedImages.forEach((image) => {
    html += `
            <button class="button button--side" value="${image}">
                <img src="pics/tasks/${image}" id="${image}" />
            </button>`;
  });
  html += '</div>';
  sideText.insertAdjacentHTML('afterend', html);
};
