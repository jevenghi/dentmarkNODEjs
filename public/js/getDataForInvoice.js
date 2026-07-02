import { showAlert } from './alerts.js';
import axios from 'axios';

export const getInvoiceData = async (selectedTasks) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tasks/get-data-for-invoice`,
      data: { selectedTasks },
    });
    if (res.data.status === 'success') {
      return [res.data.fetchedInvoiceData, res.data.lastInvoiceNumber];
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const embedPDF = async (selectedTasks) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tasks/get-invoice-data`,
      data: { selectedTasks },
      responseType: 'blob',
    });

    const contentDisposition = res.headers['content-disposition'];
    let filename = 'invoice.pdf';

    if (contentDisposition && contentDisposition.includes('filename=')) {
      filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
    }

    const file = new Blob([res.data], { type: 'application/pdf' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = filename;
    // document.body.appendChild(downloadLink);
    downloadLink.click();

    // URL.revokeObjectURL(downloadLink.href);

    // location.reload();
    setTimeout(() => {
      URL.revokeObjectURL(downloadLink.href);
      location.reload();
    }, 2000);
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const getInvoiceAddress = async (customerId) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/users/invoices/${customerId}`,
    });
    if (res.data.status === 'success') {
      return res.data.invoiceAddress;
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const updateInvoiceAddress = async (customerId, newInvoiceAddress) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/invoices/${customerId}`,
      data: { newInvoiceAddress },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Invoice address changed successfully!');
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
