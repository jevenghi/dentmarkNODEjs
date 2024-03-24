import { showAlert } from './alerts.js';
import axios from 'axios';

const isFrontOrRear = (side) => {
  return side.slice(-2) === 'fr' || side.slice(-2) === 're';
};

const markerStyle = (shape, marker, side, coords, orientationDent, w1, w2, h1, h2, x1, x2, y1, y2) => {
  marker.style.width = isFrontOrRear(side) ? w1 : w2;
  marker.style.height = isFrontOrRear(side) ? h1 : h2;

  marker.style.left = isFrontOrRear(side) ? `${coords.x - x1}%` : `${coords.x - x2}%`;
  marker.style.top = isFrontOrRear(side) ? `${coords.y - y1}%` : `${coords.y - y2}%`;
  if (shape === 'line') {
    marker.style.borderRadius = '0.8rem';
    marker.style.transform = `rotate(${orientationDent})`;
  }
};

export const placeMarker = (side, shape, length, orientationDent, paintDamaged, coords, image) => {
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
      markerStyle('nonagon', marker, side, coords, null, '1.3rem', '0.5rem', '1.3rem', '0.5rem', 2, 0.8, 2.6, 2.6);
    } else if (shape === 'line') {
      markerStyle('line', marker, side, coords, orientationDent, '1.5rem', '0.8rem', '0.6rem', '0.3rem', 2, 1, 1.5, 1.8);
    }
  }

  if (length === 'medium') {
    if (shape === 'nonagon') {
      markerStyle('nonagon', marker, side, coords, null, '2rem', '0.8rem', '2rem', '0.8rem', 2.6, 1, 3.6, 3);
    } else if (shape === 'line') {
      markerStyle('line', marker, side, coords, orientationDent, '2.2rem', '1.4rem', '0.8rem', '0.5rem', 3.2, 2, 1.8, 2.6);
    }
  }

  if (length === 'big') {
    if (shape === 'nonagon') {
      markerStyle('nonagon', marker, side, coords, null, '2.6rem', '1.6rem', '2.6rem', '1.6rem', 3.4, 2, 5, 5.3);
    } else if (shape === 'line') {
      markerStyle('line', marker, side, coords, orientationDent, '2.9rem', '2.2rem', '1.2rem', '0.8rem', 3.8, 3.2, 2.5, 4.2);
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
