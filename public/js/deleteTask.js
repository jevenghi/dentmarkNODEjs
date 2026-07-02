import { showAlert } from './alerts.js';
import axios from 'axios';
import { translations } from './translations';

const t = (key) =>
  translations[document.documentElement.lang || 'en']?.[key] ||
  translations.en[key];

export const deleteTask = async (taskId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tasks/${taskId}`,
    });

    if (res.data.status === 'success') {
      showAlert('success', t('taskDeleted'), () => {
        location.href = '/tasks';
      });
    }
  } catch (err) {
    showAlert('error', t('taskDeleteFailed'));
  }
};
