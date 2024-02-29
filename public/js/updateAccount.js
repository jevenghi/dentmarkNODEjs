/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:5501/api/v1/users/updatePassword'
        : 'http://127.0.0.1:5501/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    // if (err.response.status === 429) {
    //   showAlert('error', err.response.data);
    // } else {
    showAlert('error', err.response.data.message);
  }
};
