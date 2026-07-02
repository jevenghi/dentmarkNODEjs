import { translations } from './translations';

const t = (key) =>
  translations[document.documentElement.lang || 'en']?.[key] ||
  translations.en[key];

export const makeMarkerContainerFloating = () => {
  const sentinel = document.querySelector('.sentinel');
  const markerContainer = document.querySelector('.marker-container');
  const markerContainerHeight = markerContainer.getBoundingClientRect().height;
  const markerContainerPlaceholder = document.querySelector(
    '.marker-container-placeholder',
  );

  markerContainerPlaceholder.style.height = `${markerContainerHeight}px`;

  let lastScrollY = window.scrollY;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const currentScrollY = window.scrollY;

        if (entry.intersectionRatio === 0 && currentScrollY > lastScrollY) {
          markerContainer.classList.add('sticky');
          markerContainerPlaceholder.classList.add('visible');
        } else if (
          entry.intersectionRatio > 0 ||
          currentScrollY < lastScrollY
        ) {
          markerContainer.classList.remove('sticky');
          markerContainerPlaceholder.classList.remove('visible');
        }

        lastScrollY = currentScrollY;
      });
    },
    {
      root: null,
      threshold: 0,
      rootMargin: `+${markerContainerHeight}px`,
    },
  );

  observer.observe(sentinel);
};

export const warnUnsavedChanges = (uploadedImages, dents, warnBeforeUnload) => {
  if (uploadedImages.length > 0 && dents.length > 0 && warnBeforeUnload) {
    const confirmationMessage = t('unsavedChanges');
    event.preventDefault();
    event.returnValue = confirmationMessage;
    return confirmationMessage;
  }
};
