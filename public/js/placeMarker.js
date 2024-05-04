import { showAlert } from './alerts.js';
import axios from 'axios';
import * as markerConstants from '../../constants/markerConstants';

export const placeMarker = (bigDent, paintDamaged, coords, image) => {
  const marker = document.createElement('div');
  marker.className = 'marker';
  if (paintDamaged) {
    marker.style.borderStyle = 'dotted';
  }

  if (bigDent) {
    marker.style.width = marker.style.height = markerConstants.MARKER_BIG;
    marker.style.left = `${coords.x - markerConstants.MARKER_BIG_CORR}px`;
    marker.style.top = `${coords.y - markerConstants.MARKER_BIG_CORR}px`;
  } else {
    marker.style.left = `${coords.x - markerConstants.MARKER_SMALL_CORR}px`;
    marker.style.top = `${coords.y - markerConstants.MARKER_SMALL_CORR}px`;
  }

  image.appendChild(marker);
};

export const addDentsToTask = async (taskId, dents) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tasks/sendTask/${taskId}`,
      data: { dents },
    });
    if (res.data.status === 'success') {
      // alert('Dents successfully added!');
      window.setTimeout(() => {
        // window.scrollTo(0, 0);
        location.reload();
      }, 0);
    }
  } catch (err) {
    console.log(err);
    showAlert(err);
  }
};
