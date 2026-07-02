import { showAlert } from './alerts.js';
import axios from 'axios';
import * as markerConstants from '../../constants/markerConstants';
import { translations } from './translations';

const t = (key) =>
  translations[document.documentElement.lang || 'en']?.[key] ||
  translations.en[key];

export const placeMarker = (bigDent, paintDamaged, coords, image, id) => {
  const marker = document.createElement('div');
  marker.className = 'marker';
  // if (id !== null) {
  //   marker.dataset.markerId = id;
  // }
  marker.dataset.markerId = id;

  let currentWidth = parseInt(markerConstants.UPLOADED_IMAGE_WIDTH) * 1;
  let currentHeight = image.clientHeight;
  let markerLeftPercent = parseFloat(coords.relativeX);
  let markerTopPercent = parseFloat(coords.relativeY);

  let markerLeftPx = (markerLeftPercent / 100) * currentWidth;
  let markerTopPx = (markerTopPercent / 100) * currentHeight;
  if (paintDamaged) {
    marker.style.borderStyle = 'dotted';
    marker.style.borderWidth = '0.2rem';
  }

  if (bigDent) {
    marker.style.width = marker.style.height = markerConstants.MARKER_BIG;
    marker.style.left = `${markerLeftPx - markerConstants.MARKER_BIG_CORR}px`;
    marker.style.top = `${markerTopPx - markerConstants.MARKER_BIG_CORR}px`;
    //ABSOLUTE
    // marker.style.left = `${coords.x - markerConstants.MARKER_BIG_CORR}px`;
    // marker.style.top = `${coords.y - markerConstants.MARKER_BIG_CORR}px`;
    //RELATIVE
    // marker.style.left = `${coords.relativeX - markerConstants.MARKER_BIG_CORR}%`;
    // marker.style.top = `${coords.relativeY - markerConstants.MARKER_BIG_CORR}%`;
  } else {
    marker.style.left = `${markerLeftPx - markerConstants.MARKER_SMALL_CORR}px`;
    marker.style.top = `${markerTopPx - markerConstants.MARKER_SMALL_CORR}px`;

    // marker.style.left = `${coords.x - markerConstants.MARKER_SMALL_CORR}px`;
    // marker.style.top = `${coords.y - markerConstants.MARKER_SMALL_CORR}px`;
  }

  image.appendChild(marker);
};
//TODO: error handling
export const addDentsToTask = async (taskId, dents, images) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tasks/sendTask/${taskId}`,
      data: { dents, images },
    });
    if (res.data.status === 'success') {
      showAlert('success', t('changesSaved'));
      // window.setTimeout(() => {
      //   // window.scrollTo(0, 0);
      //   location.reload();
      // }, 0);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const removeAllMarkers = (markers, imageContainer) => {
  if (markers.length > 0) {
    while (markers.length > 0) {
      imageContainer.removeChild(markers[0]);
    }
  }
};

export const markerRemover = (dentsTemp, img) => {
  document.querySelectorAll('.marker').forEach((marker) => {
    marker.addEventListener('click', () => {
      const confirmed = confirm(t('removeThisMarker'));
      if (confirmed) {
        marker.remove();
        const markerId = marker.dataset.markerId;
        dentsTemp[img] = dentsTemp[img].filter(
          (obj) => obj.markerId !== markerId,
        );
      }
    });
  });
};

// export const markerRemover = (dentsTemp, img) => {
//   const parentElement = document.querySelector('.image-container');

//   parentElement.addEventListener('click', (event) => {
//     if (event.target.classList.contains('marker')) {
//       const marker = event.target;

//       marker.remove();
//       dentsTemp[img] = dentsTemp[img].filter(
//         (obj) => obj._id !== marker.dataset.markerId,
//       );
//     }
//   });
// };

export const removeLastMarker = (markers, dents, imageContainer) => {
  if (markers.length > 0) {
    const lastMarker = markers[markers.length - 1];
    imageContainer.removeChild(lastMarker);
  }
  if (dents) dents.pop();
};
