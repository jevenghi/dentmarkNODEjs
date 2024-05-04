import axios from 'axios';

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
