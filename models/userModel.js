const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name must have less than 50 letters'],
    minlength: [2, 'Name must have more than 1 letter'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your e-mail address'],
    lowercase: true,
    trim: true,
    maxlength: [50, 'Email must have less than 50 characters'],
    minlength: [5, 'Email must have more than 5 characters'],
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
