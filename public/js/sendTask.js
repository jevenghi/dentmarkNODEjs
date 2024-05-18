import axios from 'axios';
import { showAlert } from './alerts';

export const sendTask = async (
  customer = '',
  carModel,
  dents,
  images,
  specialCase,
  remark,
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/tasks/sendTask',
      data: { user: customer, carModel, dents, images, specialCase, remark },
    });
    if (res.data.status === 'success') {
      alert('Your task is sent successfully! We will contact you soon.');

      window.setTimeout(() => {
        window.scrollTo(0, 0);
        location.reload();
      }, 50);
    }
  } catch (err) {
    console.log(err.response.data.message);
    showAlert('error', 'Sending task failed');
  }
};
