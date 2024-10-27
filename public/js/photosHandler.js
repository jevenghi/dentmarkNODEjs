import { showAlert } from './alerts.js';
import { placeMarker, populateSidesWithDents } from './placeMarker.js';
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
    throw err.response.data.message === 'Unexpected field'
      ? 'You can upload up to 10 images'
      : // : 'Error uploading photos';
        err.response.data.message;
  }
};

// export const renderVehicleImageFromUploads = (uploadedImages) => {
//   const sidesContainer = document.querySelector('.sides-container');
//   const sideText = document.querySelector('.choose__side');

//   if (sidesContainer) sidesContainer.remove();
//   let html = '<div class="sides-container">';
//   uploadedImages.forEach((image) => {
//     html += `
//             <button class="button button--side" value="${image}">
//                 <img src="/pics/tasks/${image}" id="${image}" />
//             </button>`;
//   });
//   html += '</div>';
//   sideText.insertAdjacentHTML('afterend', html);
// };

export const renderVehicleImageFromUploads = (uploadedImages) => {
  const sidesContainer = document.querySelector('.sides-container');
  const sideText = document.querySelector('.choose__side');

  sidesContainer.innerHTML = uploadedImages
    .map(
      (image) => `
    <button class="button button--side" value="${image}">
      <img src="/pics/tasks/${image}" id="${image}" />
    </button>`,
    )
    .join('');
};

export const getImagesAndDents = async (taskId) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/tasks/${taskId}`,
    });
    if (res.data.status === 'success') {
      const { images, dents } = res.data.data;

      const groupedDents = dents.reduce((acc, obj) => {
        const { imageId } = obj;
        if (!acc[imageId]) {
          acc[imageId] = [];
        }
        acc[imageId].push(obj);
        return acc;
      }, {});

      // renderVehicleImageFromUploads(images);
      // sideSelection = document.querySelector('.sides-container');

      // setTimeout(function () {
      //   sideSelection.classList.add('visible');
      // }, 50);
      // // populateSidesWithDents(groupedDents, 'pics_temp');
      return { images, groupedDents };
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};
// export const uploadPhotosTemp = async (e) => {
//   e.preventDefault();
//   const vehicleImage = imageContainer.querySelector('#vehicleImage');
//   if (vehicleImage) vehicleImage.src = '';
//   const form = new FormData();
//   const images = document.getElementById('photo').files;
//   if (images.length === 0) return showAlert('error', 'No files chosen');
//   uploadPhoto.textContent = 'Uploading...';

//   Array.from(images).forEach((file) => {
//     form.append('images', file);
//   });

//   try {
//     const res = await axios({
//       method: 'POST',
//       url: `/api/v1/photos/uploadPhotos`,
//       data: form,
//     });
//     if (res.data.status === 'success') {
//       const uploadedImages = res.data.imageNames;
//       uploadedImages.forEach((image) => {
//         uploadedImages.push(image);
//       });
//     }
//   } catch (err) {
//     showAlert(
//       'error',
//       err.response.data.message === 'Unexpected field'
//         ? 'You can upload up to 10 images'
//         : err.response.data.message,
//     );
//   }
//   uploadPhoto.textContent = 'Upload';
// };
