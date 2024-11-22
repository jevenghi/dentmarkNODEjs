import axios from 'axios';
import { showAlert } from './alerts';

export const updateStatusBulk = async (updatedStatus, selectedTasks) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/tasks/update-status-bulk`,
      updatedStatus,
      data: { updatedStatus, selectedTasks },
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message, () => location.reload());
    }
  } catch (err) {
    // if (err.response.status === 429) {
    //   showAlert('error', err.response.data);
    // } else {
    showAlert('error', err);
    console.log(err);
  }
};
