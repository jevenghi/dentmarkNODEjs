const populateSidesWithDents = (dents) => {
  const imageContainer = document.querySelector('.image-container');

  const markers = imageContainer.getElementsByClassName('marker');
  const buttonsSide = document.querySelectorAll('.button--side');
  buttonsSide.forEach((button) => {
    button.addEventListener('click', () => {
      buttonsSide.forEach((btn) => {
        btn.style.border = 'none';
      });

      removeAllMarkers(markers);
      const addNewDentsToTask = document.querySelector('.save-new-dents');

      button.style.border = '0.3rem solid coral';
      img = button.value;
      let vehicleImage = document.getElementById('vehicleImage');
      vehicleImage.style.width = UPLOADED_IMAGE_WIDTH;
      vehicleImage.src = `/pics/tasks/${img}`;
      vehicleImage.setAttribute('data-image-id', img);

      removeMarksContainer.classList.remove('hidden');
      if (addNewDentsToTask) addNewDentsToTask.classList.remove('hidden');
      // sendMarksBtn.classList.remove('hidden');
      paintDamagedCheck.checked = false;
      bigDentCheck.checked = false;
      dentPaintDamaged = false;
      bigDent = false;

      if (sendContainer) sendContainer.classList.remove('hidden');
      markerContainer.classList.remove('hidden');
      setTimeout(function () {
        markerContainer.classList.add('visible');
      }, 50);
      makeMarkerContainerFloating();
      const searchBar = document.querySelector('.search-bar');
      if (searchBar) searchBar.classList.remove('hidden');

      let sideDents = dents[img];
      if (sideDents && sideDents.length > 0) {
        sideDents.forEach((dent) => {
          placeMarker(
            dent.bigDent,
            dent.paintDamaged,
            dent.coords,
            imageContainer,
            dent._id,
          );
        });
      }
      markerRemover(dentsTemp, dents);
      // document.querySelectorAll('.marker').forEach((marker) => {
      //   marker.addEventListener('click', () => {
      //     const confirmed = confirm('Remove this marker?');
      //     if (confirmed) {
      //       marker.remove();
      //       dentsTemp[img] = dents[img].filter(
      //         (obj) => obj._id !== marker.dataset.markerId,
      //       );
      //     }
      //   });
      // });
    });
  });
};

buttonsSide.forEach((button) => {
  button.addEventListener('click', () => {
    buttonsSide.forEach((btn) => {
      btn.style.border = 'none';
    });
    removeAllMarkers(markers);

    button.style.border = '0.3rem solid coral';
    img = button.value;
    let vehicleImage = document.getElementById('vehicleImage');
    vehicleImage.style.width = UPLOADED_IMAGE_WIDTH;
    vehicleImage.src = `/pics/tasks/${img}`;
    vehicleImage.setAttribute('data-image-id', img);

    removeMarksContainer.classList.remove('hidden');
    if (sendMarksBtn) sendMarksBtn.classList.remove('hidden');
    paintDamagedCheck.checked = false;
    bigDentCheck.checked = false;
    dentPaintDamaged = false;
    bigDent = false;

    if (sendContainer) sendContainer.classList.remove('hidden');
    markerContainer.classList.remove('hidden');
    setTimeout(function () {
      markerContainer.classList.add('visible');
    }, 50);

    makeMarkerContainerFloating();

    const searchBar = document.querySelector('.search-bar');
    if (searchBar) searchBar.classList.remove('hidden');

    const sideDents = dentsTemp[img];

    if (sideDents && sideDents.length > 0) {
      sideDents.forEach((dent) => {
        placeMarker(
          dent.bigDent,
          dent.paintDamaged,
          dent.coords,
          imageContainer,
        );
      });
    }
    if (taskHeader) {
      document.querySelectorAll('.marker').forEach((marker) => {
        marker.addEventListener('click', () => {
          const confirmed = confirm('Remove this marker?');
          if (confirmed) {
            marker.remove();
            console.log('dents', dents);
            dentsTemp[img] = dents[img].filter(
              (obj) => obj._id !== marker.dataset.markerId,
            );
          }
        });
      });
    }
  });
});
const butonsSideHandler = () => {
  buttonsSide.forEach((btn) => {
    btn.style.border = 'none';
  });
  removeAllMarkers(markers);

  button.style.border = '0.3rem solid coral';
  img = button.value;
  let vehicleImage = document.getElementById('vehicleImage');
  vehicleImage.style.width = UPLOADED_IMAGE_WIDTH;
  vehicleImage.src = `/pics/tasks/${img}`;
  vehicleImage.setAttribute('data-image-id', img);

  removeMarksContainer.classList.remove('hidden');
  if (sendMarksBtn) sendMarksBtn.classList.remove('hidden');
  paintDamagedCheck.checked = false;
  bigDentCheck.checked = false;
  dentPaintDamaged = false;
  bigDent = false;

  if (sendContainer) sendContainer.classList.remove('hidden');
  markerContainer.classList.remove('hidden');
  setTimeout(function () {
    markerContainer.classList.add('visible');
  }, 50);

  makeMarkerContainerFloating();

  const searchBar = document.querySelector('.search-bar');
  if (searchBar) searchBar.classList.remove('hidden');

  const sideDents = dentsTemp[img];

  if (sideDents && sideDents.length > 0) {
    sideDents.forEach((dent) => {
      placeMarker(dent.bigDent, dent.paintDamaged, dent.coords, imageContainer);
    });
  }
};
