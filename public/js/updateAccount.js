/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { translations } from './translations';

const t = (key) =>
  translations[document.documentElement.lang || 'en']?.[key] ||
  translations.en[key];

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        type === 'password' ? t('passwordUpdated') : t('accountUpdated'),
        () => {
          location.reload();
        },
      );
    }
  } catch (err) {
    // if (err.response.status === 429) {
    //   showAlert('error', err.response.data);
    // } else {
    showAlert('error', err.response.data.message);
  }
};
