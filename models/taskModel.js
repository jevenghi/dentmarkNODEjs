const mongoose = require('mongoose');

const dentSchema = new mongoose.Schema({
  img: String,
  shape: String,
  length: String,
  orientation: String,
  paintDamaged: String,
  coords: Object,
  cost: Number,
  markerNumber: Number,
  status: String,
  id: String,
});

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
    carModel: {
      type: String,
      required: [true, 'Model should be specified'],
      trim: true,
      maxlength: [50, 'Car model name must not exceed 50 characters'],
      minlength: [5, 'Car model name must have at least 4 characters'],
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
    // dents: {
    //   type: Object,
    //   required: true,
    // },
    dents: [dentSchema],
    taskStatus: {
      type: String,
      default: 'open',
      enum: {
        values: ['open', 'complete-not-paid', 'in-progress', 'paid'],
      },
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
//TODO: add completedAt field to task schema
taskSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

taskSchema.virtual('totalCost').get(function () {
  let totalCost = 0;
  if (this.dents && this.dents.length > 0) {
    totalCost = this.dents.reduce((acc, dent) => acc + (dent.cost || 0), 0);
  }
  return totalCost;
});

// taskSchema.virtual('totalCostDents').get(function () {
//   let totalCost = 0;
//   if (this.dents && this.dents.length > 0) {
//     totalCost = this.dents.reduce((acc, dent) => acc + (dent.cost || 0), 0);
//   }
//   return totalCost;
// });

// taskSchema.pre('save', function (next) {
//   this.totalCost = this.totalCostDents;
//   next();
// });

// taskSchema.virtual('totalCost').get(function () {
//   return this.totalCostDents;
// });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
