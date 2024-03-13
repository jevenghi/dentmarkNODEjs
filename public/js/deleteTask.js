import { showAlert } from './alerts.js';
import axios from 'axios';

export const deleteTask = async (taskId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `http://127.0.0.1:5501/api/v1/tasks/${taskId}`,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Task deleted successfully', () => {
        location.href = '/tasks';
      });
    }
  } catch (err) {
    showAlert('error', 'Error deleting task');
  }
};
