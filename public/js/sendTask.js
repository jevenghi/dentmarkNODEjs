import axios from 'axios';
import { showAlert } from './alerts';
import { translations } from './translations';

export const sendTask = async (
  customer = '',
  carModel,
  dents,
  images,
  specialCase,
  remark,
  defaultLang,
  emailAddress = '',
) => {
  try {
    const isGuest = Boolean(emailAddress);
    const res = await axios({
      method: 'POST',
      url: isGuest ? '/api/v1/tasks/sendGuestTask' : '/api/v1/tasks/sendTask',
      data: {
        user: customer,
        emailAddress,
        carModel,
        dents,
        images,
        specialCase,
        remark,
      },
    });
    if (res.data.status === 'success') {
      alert(translations[defaultLang]['taskSent']);

      window.setTimeout(() => {
        window.scrollTo(0, 0);
        location.reload();
      }, 50);
    }
  } catch (err) {
    console.error(err);
    const message =
      err.response?.data?.message || translations[defaultLang]['taskSendFailed'];
    showAlert('error', message);
  }
};
