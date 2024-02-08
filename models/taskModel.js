const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
  user: {
    type: String,
    required: [true, 'Customer name should be specified'],
    trim: true,
    maxlength: [50, 'Name must have less than 50 letters'],
    minlength: [2, 'Name must have more than 1 letter'],
  },
  carModel: {
    type: String,
    required: [true, 'Model should be specified'],
    trim: true,
    maxlength: [50, 'Car model name must have less than 50 letters'],
    minlength: [5, 'Car model name must have more than 4 letter'],
  },
  bodyType: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty can be easy, medium or difficult',
    },
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

// taskSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
