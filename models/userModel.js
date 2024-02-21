const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
      maxlength: [50, 'Name must not exceed 50 characters'],
      minlength: [2, 'Name must have more than 1 character'],
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid e-mail address'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid e-mail address'],
    },
    company: {
      type: String,
      maxlength: [50, 'Company name must not exceed 50 characters'],
      minlength: [2, 'Company ame must have more than 1 character'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin'],
      default: 'user',
      select: false,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same.',
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailConfirmationToken: String,
    emailConfirmationTokenExpires: Date,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.virtual('tasks', {
  ref: 'Task',
  foreignField: 'user',
  localField: '_id',
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const createCryptoToken = (expiresIn = 10 * 60) => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = Date.now() + expiresIn * 1000;
  return { token, hashedToken, expiresAt };
};

userSchema.methods.createPasswordResetToken = function () {
  // const resetToken = crypto.randomBytes(32).toString('hex');
  // this.passwordResetToken = crypto
  //   .createHash('sha256')
  //   .update(resetToken)
  //   .digest('hex');
  // this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // return resetToken;
  const { token, hashedToken, expiresAt } = createCryptoToken(); // Expires in 10 minutes
  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = expiresAt;
  return token;
};

userSchema.methods.createEmailConfirmationToken = function () {
  const { token, hashedToken, expiresAt } = createCryptoToken(24 * 60 * 60); // Expires in 24 hours
  this.emailConfirmationToken = hashedToken;
  this.emailConfirmationTokenExpires = expiresAt;
  return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
