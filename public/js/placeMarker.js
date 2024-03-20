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
  marker.style.left = this._isFrontOrRear(side)
    ? `${coords.x - 4}%`
    : `${coords.x - 1}%`;
  marker.style.top = this._isFrontOrRear(side)
    ? `${coords.y - 3.5}%`
    : `${coords.y - 3}%`;

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
};
