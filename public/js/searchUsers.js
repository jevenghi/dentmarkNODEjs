import axios from 'axios';
import { showAlert } from './alerts';
import { translations } from './translations';

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

export const translateContent = async (defaultLang, translations) => {
  const elementsToTranslate = document.querySelectorAll('[data-key]');
  const placeholdersToTranslate = document.querySelectorAll(
    '[data-placeholder-key]',
  );
  const statusesToTranslate = document.querySelectorAll('[data-status]');

  defaultLang = await getUserLanguagePref();
  document.documentElement.lang = defaultLang;

  setLanguage(defaultLang);
  return defaultLang;

  function setLanguage(language) {
    elementsToTranslate.forEach((element) => {
      const key = element.getAttribute('data-key');
      if (translations[language][key]) {
        element.textContent = translations[language][key];
      }
    });

    placeholdersToTranslate.forEach((element) => {
      const key = element.getAttribute('data-placeholder-key');
      if (translations[language][key]) {
        element.setAttribute('placeholder', translations[language][key]);
      }
    });

    statusesToTranslate.forEach((element) => {
      const status = element.getAttribute('data-status');
      const key =
        {
          open: 'open',
          'in-progress': 'inProgress',
          pending: 'notPaid',
          complete: 'paid',
        }[status] || status;
      if (translations[language][key]) {
        element.textContent = translations[language][key];
      }
    });
  }
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
    const language = await getUserLanguagePref();
    return showAlert('error', translations[language].onlyLettersNumbers);
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
