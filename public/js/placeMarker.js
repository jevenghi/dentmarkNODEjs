import { showAlert } from './alerts.js';
import axios from 'axios';
import * as markerConstants from '../../constants/markerConstants';

const isFrontOrRear = (side) => {
  return side.slice(-2) === 'fr' || side.slice(-2) === 're';
};

const markerStyle = (
  shape,
  marker,
  side,
  coords,
  orientationDent,
  w1,
  w2,
  h1,
  h2,
  x1,
  x2,
  y1,
  y2,
) => {
  marker.style.width = isFrontOrRear(side) ? w1 : w2;
  marker.style.height = isFrontOrRear(side) ? h1 : h2;

  // marker.style.left = isFrontOrRear(side)
  //   ? `${coords.relativeX - x1}%`
  //   : `${coords.relativeX - x2}%`;
  // marker.style.top = isFrontOrRear(side)
  //   ? `${coords.relativeY - y1}%`
  //   : `${coords.relativeY - y2}%`;
  marker.style.left = isFrontOrRear(side)
    ? `${coords.x - x1}px`
    : `${coords.x - x2}px`;
  marker.style.top = isFrontOrRear(side)
    ? `${coords.y - y1}px`
    : `${coords.y - y2}px`;
  if (shape === 'line') {
    marker.style.borderRadius = '0.8rem';
    marker.style.transform = `rotate(${orientationDent})`;
  }
};

export const placeMarker = (
  side,
  shape,
  length,
  orientationDent,
  paintDamaged,
  coords,
  image,
) => {
  const marker = document.createElement('div');
  marker.className = 'marker';
  // marker.style.left = isFrontOrRear(side) ? `${coords.x - 2}%` : `${coords.x - 1}%`;
  // marker.style.top = isFrontOrRear(side) ? `${coords.y - 3.5}%` : `${coords.y - 3}%`;

  if (paintDamaged) {
    const markerX = document.createElement('span');
    markerX.textContent = 'X';
    marker.appendChild(markerX);
  }

  if (length === 'small') {
    if (shape === 'nonagon') {
      markerStyle(
        'nonagon',
        marker,
        side,
        coords,
        null,
        markerConstants.CIRCLE_SMALL_FR_REAR,
        markerConstants.CIRCLE_SMALL_SIDES,
        markerConstants.CIRCLE_SMALL_FR_REAR,
        markerConstants.CIRCLE_SMALL_SIDES,
        markerConstants.CIRCLE_SMALL_X_CORR,
        markerConstants.CIRCLE_SMALL_X_CORR,
        markerConstants.CIRCLE_SMALL_Y_CORR,
        markerConstants.CIRCLE_SMALL_Y_CORR,
      );
    } else if (shape === 'line') {
      markerStyle(
        'line',
        marker,
        side,
        coords,
        orientationDent,
        markerConstants.LINE_SMALL_W,
        markerConstants.LINE_SMALL_W,
        markerConstants.LINE_SMALL_H,
        markerConstants.LINE_SMALL_H,
        markerConstants.LINE_SMALL_X_CORR,
        markerConstants.LINE_SMALL_X_CORR,
        markerConstants.LINE_SMALL_Y_CORR,
        markerConstants.LINE_SMALL_Y_CORR,
      );
    }
  }

  if (length === 'medium') {
    if (shape === 'nonagon') {
      markerStyle(
        'nonagon',
        marker,
        side,
        coords,
        null,
        markerConstants.CIRCLE_MEDIUM_FR_REAR,
        markerConstants.CIRCLE_MEDIUM_SIDES,
        markerConstants.CIRCLE_MEDIUM_FR_REAR,
        markerConstants.CIRCLE_MEDIUM_SIDES,
        markerConstants.CIRCLE_MEDIUM_X_CORR,
        markerConstants.CIRCLE_MEDIUM_X_CORR,
        markerConstants.CIRCLE_MEDIUM_Y_CORR,
        markerConstants.CIRCLE_MEDIUM_Y_CORR,
      );
    } else if (shape === 'line') {
      markerStyle(
        'line',
        marker,
        side,
        coords,
        orientationDent,
        markerConstants.LINE_MEDIUM_W,
        markerConstants.LINE_MEDIUM_W,
        markerConstants.LINE_MEDIUM_H,
        markerConstants.LINE_MEDIUM_H,
        markerConstants.LINE_MEDIUM_X_CORR,
        markerConstants.LINE_MEDIUM_X_CORR,
        markerConstants.LINE_MEDIUM_Y_CORR,
        markerConstants.LINE_MEDIUM_Y_CORR,
      );
    }
  }

  if (length === 'big') {
    if (shape === 'nonagon') {
      markerStyle(
        'nonagon',
        marker,
        side,
        coords,
        null,
        markerConstants.CIRCLE_LARGE_FR_REAR,
        markerConstants.CIRCLE_LARGE_SIDES,
        markerConstants.CIRCLE_LARGE_FR_REAR,
        markerConstants.CIRCLE_LARGE_SIDES,
        markerConstants.CIRCLE_LARGE_X_CORR,
        markerConstants.CIRCLE_LARGE_X_CORR,
        markerConstants.CIRCLE_LARGE_Y_CORR,
        markerConstants.CIRCLE_LARGE_Y_CORR,
      );
    } else if (shape === 'line') {
      markerStyle(
        'line',
        marker,
        side,
        coords,
        orientationDent,
        markerConstants.LINE_LARGE_W,
        markerConstants.LINE_LARGE_W,
        markerConstants.LINE_LARGE_H,
        markerConstants.LINE_LARGE_H,
        markerConstants.LINE_LARGE_X_CORR,
        markerConstants.LINE_LARGE_X_CORR,
        markerConstants.LINE_LARGE_Y_CORR,
        markerConstants.LINE_LARGE_Y_CORR,
      );
    }
  }

  // if (length === 'small') {
  //   if (shape === 'nonagon') {
  //     marker.style.width = isFrontOrRear(side) ? '1.3rem' : '0.5rem';
  //     marker.style.height = isFrontOrRear(side) ? '1.3rem' : '0.5rem';
  //   } else if (shape === 'line') {
  //     marker.style.width = isFrontOrRear(side) ? '1.5rem' : '0.8rem';
  //     marker.style.height = isFrontOrRear(side) ? '0.6rem' : '0.3rem';
  //     marker.style.borderRadius = '0.8rem';
  //     marker.style.transform = `rotate(${orientationDent})`;
  //   }
  // }
  // if (length === 'medium') {
  //   if (shape === 'nonagon') {
  //     marker.style.width = isFrontOrRear(side) ? '2rem' : '0.8rem';
  //     marker.style.height = isFrontOrRear(side) ? '2rem' : '0.8rem';
  //   } else if (shape === 'line') {
  //     marker.style.width = isFrontOrRear(side) ? '2.2rem' : '1.4rem';
  //     marker.style.height = isFrontOrRear(side) ? '0.8rem' : '0.5rem';
  //     marker.style.borderRadius = '0.8rem';
  //     marker.style.transform = `rotate(${orientationDent})`;
  //   }
  // }
  // if (length === 'big') {
  //   if (shape === 'nonagon') {
  //     marker.style.width = isFrontOrRear(side) ? '2.6rem' : '1.6rem';
  //     marker.style.height = isFrontOrRear(side) ? '2.6rem' : '1.6rem';
  //   } else if (shape === 'line') {
  //     marker.style.width = isFrontOrRear(side) ? '2.9rem' : '2.2rem';
  //     marker.style.height = isFrontOrRear(side) ? '1.2rem' : '0.8rem';
  //     marker.style.borderRadius = '0.8rem';
  //     marker.style.transform = `rotate(${orientationDent})`;
  //   }
  // }

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
      }, 50);
    }
  } catch (err) {
    console.log(err);
    alert(err);
  }
};
