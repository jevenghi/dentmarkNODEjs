const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      // required: [true, 'Customer name should be specified'],
      // trim: true,
      // maxlength: [50, 'Name must have less than 50 letters'],
      // minlength: [2, 'Name must have more than 1 letter'],
    },
    carModel: {
      type: String,
      required: [true, 'Model should be specified'],
      unique: true,
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
    dents: {
      type: Object,
      required: true,
    },
    taskStatus: {
      type: String,
      default: 'open',
      enum: {
        values: ['open', 'inProgress', 'closed'],
        message: 'Status can be open, inProgress or closed',
      },
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// taskSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// taskSchema.statics.calcDifficulty = function (task) {};

taskSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
