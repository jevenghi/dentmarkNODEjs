const mongoose = require('mongoose');

const dentSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
  },
  shape: {
    type: String,
    required: true,
  },
  length: String,
  orientation: {
    type: String,
    default: null,
  },
  paintDamaged: {
    type: String,
    enum: ['yes', 'no'],
    required: true,
  },
  //   coords: {
  //     x: {
  //       type: Number,
  //       required: true,
  //     },
  //     y: {
  //       type: Number,
  //       required: true,
  //     },
  //   },
  coords: Object,
  cost: {
    type: Number,
    min: 0,
    max: 1000,
  },
  status: {
    type: String,
    default: 'open',
    enum: {
      values: ['open', 'inProgress', 'closed'],
      message: 'Status can be open, inProgress or closed',
    },
  },
  markerNumber: {
    type: Number,
    min: 1,
    max: 20,
  },
});

const Dent = mongoose.model('Dent', dentSchema);
module.exports = Dent;
