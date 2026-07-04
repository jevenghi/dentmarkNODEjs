import axios from 'axios';
import { showAlert } from './alerts';

const searchResults = document.getElementById('search-results');

export const searchUsers = async (userInput) => {
  try {
    const response = await axios.get('/api/v1/users/suggestUser', {
      params: {
        q: userInput,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error.response.data.message;
  }
};

export const getUserLanguagePref = async () => {
  try {
    const response = await axios.get('/api/v1/users/get-lang-pref');
    return response.data.language;
  } catch (err) {
    console.log(err);
  }
};

export const setLanguage = (language, translations) => {
  const elementsToTranslate = document.querySelectorAll('[data-key]');
  const placeholderElements = [
    ['.form__input--guest-email', 'emailAddress'],
    ['.form__input--model', 'vehicleModelPlaceholder'],
    ['.form__input--kenteken', 'licensePlatePlaceholder'],
    ['.form__input--note', 'additionalNotesPlaceholder'],
  ];

  document.documentElement.lang = language;

  elementsToTranslate.forEach((element) => {
    const key = element.getAttribute('data-key');
    element.textContent = translations[language]?.[key] || element.textContent;
  });

  placeholderElements.forEach(([selector, key]) => {
    const element = document.querySelector(selector);
    if (element && translations[language]?.[key]) {
      element.placeholder = translations[language][key];
    }
  });

  document
    .querySelectorAll('.main-language-switcher [data-language]')
    .forEach((button) => {
      const isActive = button.dataset.language === language;
      button.classList.toggle('language-link--active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
};

export const translateContent = async (defaultLang, translations) => {
  const isGuestPage = Boolean(
    document.querySelector('.form__input--guest-email'),
  );
  const pageLanguage = document.documentElement.lang === 'nl' ? 'nl' : 'en';
  const userLanguage = isGuestPage ? null : await getUserLanguagePref();
  const language = userLanguage || defaultLang || pageLanguage;

  setLanguage(language, translations);
  return language;
};

export const displayResults = (results, searchResults) => {
  clearResults(searchResults);

  if (results.length > 0) {
    results.forEach(function (result) {
      const link = document.createElement('a');
      link.textContent = result;
      searchResults.appendChild(link);
    });
    searchResults.style.display = 'block';
  } else {
    searchResults.style.display = 'none';
  }
};
export const clearResults = (searchResults) => {
  while (searchResults.firstChild) {
    searchResults.removeChild(searchResults.firstChild);
  }
  searchResults.style.display = 'none';
};
export const userAutoSuggest = async (userInput, searchResults) => {
  const regex = /^[A-Za-z0-9\s]*$/;

  if (userInput !== '' && !regex.test(userInput)) {
    return showAlert('error', 'Only letters and numbers are allowed.');
  }
  if (userInput.length > 0) {
    try {
      const response = await searchUsers(userInput);
      displayResults(response, searchResults);
    } catch (error) {
      showAlert('error', error);
    }
  } else {
    clearResults(searchResults);
  }
};
