const placeMarker = function (
  shape,
  length,
  orientationDent,
  paintDamaged,
  coords,
  image,
) {
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
};

module.exports = placeMarker;
