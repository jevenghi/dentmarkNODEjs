import { showAlert } from './alerts.js';
import axios from 'axios';

export const generatePDF = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:5501/api/v1/tasks/generate-admin-report',
      params: { status },
    });
    if (res.data.status === 'success') {
      console.log(res);
    } else {
      showAlert('error', res.data.message);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    // alert(err.response.data.message);
  }
};
