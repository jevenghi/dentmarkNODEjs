import { showAlert } from './alerts.js';
import axios from 'axios';
import { translations } from './translations';

const t = (key) =>
  translations[document.documentElement.lang || 'en']?.[key] ||
  translations.en[key];

export const updateTask = async (taskId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/tasks/${taskId}`,
      data: data,
    });

    if (res.data.status === 'success') {
      showAlert('success', t('savedSuccessfully'));
      // location.reload();
    }
  } catch (err) {
    // if (err.response.status === 429) {
    //   showAlert('error', err.response.data);
    // } else {
    showAlert('error', err.response.data.message);
    console.log(err);
  }
};
