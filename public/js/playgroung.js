vehicleImage.addEventListener('click', (event) => {
  event.preventDefault();
  if (this.#dents.length > 100) {
    return this._showAlert(
      'error',
      'You can place maximum 100 markers per vehicle. We will take care of the rest on site',
    );
  }
  const imageRect = vehicleImage.getBoundingClientRect();
  this.#storedCoordinates = {
    x: event.offsetX,
    y: event.offsetY,
    relativeX: ((event.clientX - imageRect.left) / imageRect.width) * 100,
    relativeY: ((event.clientY - imageRect.top) / imageRect.height) * 100,
  };
  const coords = this.#storedCoordinates;
  this._placeMarker(
    this.#bodySide,
    this.#dentPaintDamaged,
    coords,
    imageContainer,
  );
  const newObj = {
    img: this.#bodySide,
    paintDamaged: this.#dentPaintDamaged,
    coords: this.#storedCoordinates,
    status: 'open',
  };
  this.#dents.push(newObj);
  if (!this.#dentsTemp[this.#bodySide]) {
    this.#dentsTemp[this.#bodySide] = [];
  }
  this.#dentsTemp[this.#bodySide].push(newObj);
});
const marker = document.createElement('div');
marker.className = 'marker';

if (paintDamaged) {
  marker.style.borderStyle = 'dotted';
  // const markerX = document.createElement('span');
  // markerX.textContent = 'X';
  // marker.appendChild(markerX);
}
marker.style.left = `${coords.x - 25}px`;
marker.style.top = `${coords.y - 25}px`;

image.appendChild(marker);
_removeAllMarkers() {
    if (markers.length > 0) {
      while (markers.length > 0) {
        imageContainer.removeChild(markers[0]);
      }
    }
  }
  _removeLastMarker() {
    if (markers.length > 0) {
      const lastMarker = markers[markers.length - 1];
      imageContainer.removeChild(lastMarker);
    }
  }

  _placeMarker(
    side,
    paintDamaged,
    coords,
    image,
  ) {
    const marker = document.createElement('div');
    marker.className = 'marker';

    if (paintDamaged) {
      marker.style.borderStyle = 'dotted';
      // const markerX = document.createElement('span');
      // markerX.textContent = 'X';
      // marker.appendChild(markerX);
    }

  
    if (length === 'big') {
      if (shape === 'nonagon') {
        this._markerStyle(
          'nonagon',
          marker,
          side,
          coords,
          null,
       
        );
      } else if (shape === 'line') {
        this._markerStyle(
          'line',
          marker,
          side,
          coords,
          orientationDent,
          LINE_LARGE_W,
     
        );
      }
    }
    image.appendChild(marker);
  }



  _markerStyle(
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
  ) {
    marker.style.width = this._isFrontOrRear(side) ? w1 : w2;
    marker.style.height = this._isFrontOrRear(side) ? h1 : h2;

    // marker.style.left = this._isFrontOrRear(side) ? `${coords.x - x1}%` : `${coords.x - x2}%`;
    // marker.style.top = this._isFrontOrRear(side) ? `${coords.y - y1}%` : `${coords.y - y2}%`;
    marker.style.left = this._isFrontOrRear(side)
      ? `${coords.x - x1}px`
      : `${coords.x - x2}px`;
    marker.style.top = this._isFrontOrRear(side)
      ? `${coords.y - y1}px`
      : `${coords.y - y2}px`;
    if (shape === 'line') {
      marker.style.borderRadius = '1rem';
      marker.style.transform = `rotate(${orientationDent})`;
    }
  }