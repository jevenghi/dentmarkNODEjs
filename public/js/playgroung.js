
const marker = document.createElement('div');
marker.className = 'marker';

if (paintDamaged) {
  marker.style.borderStyle = 'dotted';
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

  
  if (searchInput) {
    searchInput.addEventListener('input', async function () {
      const userInput = searchInput.value.trim();
      if (userInput.length > 0) {
        try {
          const response = await axios.get('/api/v1/users/suggestUser', {
            params: {
              q: userInput,
            },
          });
          displayResults(response.data);
        } catch (error) {
          console.error(error);
        }
      } else {
        clearResults();
      }
    });

    // function displayResults(results) {
    //   clearResults();

    //   if (results.length > 0) {
    //     results.forEach(function (result) {
    //       const link = document.createElement('a');
    //       link.textContent = result;
    //       searchResults.appendChild(link);
    //     });
    //     searchResults.style.display = 'block';
    //   } else {
    //     searchResults.style.display = 'none';
    //   }
    // }

    // function clearResults() {
    //   while (searchResults.firstChild) {
    //     searchResults.removeChild(searchResults.firstChild);
    //   }
    //   searchResults.style.display = 'none';
    // }

    searchResults.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        searchInput.value = customer = event.target.textContent;
        searchResults.style.display = 'none';
      }
    });

    document.addEventListener('click', function (event) {
      if (
        !searchInput.contains(event.target) &&
        !searchResults.contains(event.target)
      ) {
        searchResults.style.display = 'none';
      }
    });
  }