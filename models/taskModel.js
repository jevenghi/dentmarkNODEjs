const mongoose = require('mongoose');
require('./guestUserModel');

const TASK_STATUS_RANK = {
  open: 1,
  'in-progress': 2,
  pending: 3,
  complete: 4,
};

const getTaskStatusRank = (status = 'open') => TASK_STATUS_RANK[status] || 1;

const applyStatusRankToUpdate = (update) => {
  if (!update) return;

  const nextStatus = update.taskStatus ?? update.$set?.taskStatus;
  if (!nextStatus) return;

  const nextRank = getTaskStatusRank(nextStatus);

  if (update.$set) {
    update.$set.statusRank = nextRank;
    return;
  }

  update.statusRank = nextRank;
};

const dentSchema = new mongoose.Schema({
  imageId: String,
  bigDent: Boolean,
  paintDamaged: Boolean,
  coords: Object,
  cost: {
    type: Number,
    min: [0, 'Value can not be negative'],
    max: [10000, 'Value can not exceed 10,000'],
  },
  status: String,
  markerId: String,
});

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: function () {
        return this.userModel || 'User';
      },
      required: [true, 'Task must belong to a user'],
    },
    userModel: {
      type: String,
      enum: ['User', 'GuestUser'],
      default: 'User',
    },
    carModel: {
      type: String,
      // required: [true, 'Model should be specified'],
      trim: true,
      maxlength: [60, 'Car model name must not exceed 60 characters'],
      minlength: [5, 'Car model name must have at least 4 characters'],
    },
    year: {
      type: Number,

      min: 1990,
      max: 2030,
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
        values: ['open', 'complete', 'in-progress', 'pending'],
      },
    },
    statusRank: {
      type: Number,
      default: 1,
      enum: [1, 2, 3, 4],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    totalCost: {
      type: Number,
      min: [0, 'Cost can not be negative'],
      max: [10000, 'Cost can not exceed 10,000'],
      default: 0,
    },
    specialCase: {
      type: Boolean,
      default: false,
    },
    remark: {
      type: String,
      trim: true,
      maxlength: [150, 'Note must not exceed 150 characters'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
//TODO: add completedAt field to task schema
taskSchema.pre('save', function (next) {
  this.statusRank = getTaskStatusRank(this.taskStatus);
  next();
});

taskSchema.pre('findOneAndUpdate', function (next) {
  applyStatusRankToUpdate(this.getUpdate());
  next();
});

taskSchema.pre('updateOne', function (next) {
  applyStatusRankToUpdate(this.getUpdate());
  next();
});

taskSchema.pre('updateMany', function (next) {
  applyStatusRankToUpdate(this.getUpdate());
  next();
});

taskSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: ['name', 'invoiceAddress', 'emailAddres'],
  });
  next();
});

// taskSchema.virtual('totalCost').get(function () {
//   let totalCost = 0;
//   if (this.dents && this.dents.length > 0) {
//     totalCost = this.dents.reduce((acc, dent) => acc + (dent.cost || 0), 0);
//   }
//   return totalCost;
// });

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
