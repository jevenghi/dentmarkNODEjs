import { showAlert } from './alerts.js';
import axios from 'axios';

export const generatePDF = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('taskStatus');
  const from = urlParams.get('from');
  const to = urlParams.get('to');

  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/tasks/generate-admin-report',
      params: { status, from, to },
      responseType: 'blob',
    });
    // if (res.data.status === 'success') {
    //   console.log(res);
    // } else {
    //   showAlert('error', res.data.message);
    // }
    const blob = new Blob([res.data], { type: 'application/pdf' });

    // Create a URL for the blob object
    const url = window.URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.pdf');

    // Append the link to the document body
    document.body.appendChild(link);

    // Programmatically trigger the click event on the link to start the download
    link.click();

    // Cleanup: remove the link and revoke the URL
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showAlert('error', err);
    console.log(err);
    // alert(err.response.data.message);
  }
};
