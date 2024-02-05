const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: String,
    required: [true, 'Customer name should be specified'],
  },
  carModel: {
    type: String,
    required: [true, 'Model should be specified'],
  },
  bodyType: {
    type: String,
    required: [true, 'Body type should be specified'],
  },
  dents: {},
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
