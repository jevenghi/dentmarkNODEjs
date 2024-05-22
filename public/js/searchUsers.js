import axios from 'axios';
import { showAlert } from './alerts';

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
