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
  difficulty: {
    type: Number,
  },
  dents: {},
  taskStatus: {
    type: String,
    default: 'Open',
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
