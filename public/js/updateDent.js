import { showAlert } from './alerts.js';
import axios from 'axios';

export const updatedDent = async (taskId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:5501/api/v1/tasks/${taskId}`,
      data: data,
    });

    if (res.data.status === 'success') {
      // showAlert('success', `Saved successfully!`);
      location.reload();
    }
  } catch (err) {
    // if (err.response.status === 429) {
    //   showAlert('error', err.response.data);
    // } else {
    showAlert('error', err.response.data.message);
    console.log(err);
  }
};
