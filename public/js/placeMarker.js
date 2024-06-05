import { showAlert } from './alerts.js';
import axios from 'axios';
import * as markerConstants from '../../constants/markerConstants';

export const placeMarker = (bigDent, paintDamaged, coords, image) => {
  const marker = document.createElement('div');
  marker.className = 'marker';
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
      showAlert('success', 'Changes saved successfully!');
      // window.setTimeout(() => {
      //   // window.scrollTo(0, 0);
      //   location.reload();
      // }, 0);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
//TODO: move to index.js
// export const populateSidesWithDents = (dents, folder) => {
//   const imageContainer = document.querySelector('.image-container');

//   const markers = imageContainer.getElementsByClassName('marker');
//   const buttonsSide = document.querySelectorAll('.button--side');
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
//       vehicleImage.src = `/pics/${folder}/${img}`;
//       vehicleImage.setAttribute('data-image-id', img);

//       // removeMarksContainer.classList.remove('hidden');
//       // sendMarksBtn.classList.remove('hidden');
//       paintDamagedCheck.checked = false;
//       bigDentCheck.checked = false;
//       dentPaintDamaged = false;
//       bigDent = false;

//       // sendContainer.classList.remove('hidden');
//       // markerContainer.classList.remove('hidden');
//       // setTimeout(function () {
//       //   markerContainer.classList.add('visible');
//       // }, 50);
//       // const searchBar = document.querySelector('.search-bar');
//       // if (searchBar) searchBar.classList.remove('hidden');

//       const sideDents = dents[img];
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
// };
