const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Mongoose schema for user documents.
 *
 * This schema defines the structure of user documents in the database. It includes fields
 * for user details such as name, email, role, password, password confirmation, etc.
 * Some fields have validation rules to ensure data integrity (e.g., required, unique, minlength).
 * The 'role' field is set to 'user' by default and is not included in query results by default (select: false).
 * Virtuals are enabled for JSON and object representations of documents to include virtual properties.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
      maxlength: [50, 'Name must have less than 50 letters'],
      minlength: [2, 'Name must have more than 1 letter'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your e-mail address'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin'],
      default: 'user',
      select: false,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
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
        message: 'Passwords are not the same!',
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * Mongoose middleware for filtering out inactive users in find queries.
 *
 * This middleware is executed before any find query is executed on the user collection.
 * It modifies the query to include only active users (where 'active' is not equal to false).
 */
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

/**
 * Virtual field 'tasks' in the user schema.
 *
 * This virtual field establishes a relationship between the 'User' and 'Task' collections.
 * It allows accessing tasks associated with a user without storing them directly in the user document.
 * The 'ref' option specifies the referenced collection ('Task').
 * The 'foreignField' option specifies the field in the referenced collection ('Task') that links to the user.
 * The 'localField' option specifies the field in the local ('User') collection to match against the foreignField.
 */
userSchema.virtual('tasks', {
  ref: 'Task',
  foreignField: 'user',
  localField: '_id',
});

/**
 * Mongoose middleware for hashing user password before saving.
 *
 * This middleware is executed before saving a user document.
 * It checks if the password field has been modified, if not, it skips the hashing process.
 * If the password has been modified, it hashes the password using bcrypt with a salt factor of 12.
 * It then clears the 'passwordConfirm' field to avoid storing the plain text password confirmation.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

/**
 * Mongoose middleware for updating passwordChangedAt field before saving.
 *
 * This middleware is executed before saving a user document.
 * It checks if the password field has been modified and if the document is new.
 * If the password is not modified or the document is new, it skips the process.
 * Otherwise, it updates the 'passwordChangedAt' field to the current time minus 1 second.
 */
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/**
 * Method to check if user's password has been changed after a certain timestamp.
 * @param {number} JWTTimestamp - Timestamp from the JWT token.
 * @returns {boolean} - True if the password has been changed after the provided timestamp, false otherwise.
 *
 * This method calculates whether the user's password has been changed after a certain timestamp
 * (typically the timestamp from a JWT token). It compares the timestamp stored in 'passwordChangedAt'
 * with the provided JWTTimestamp. If 'passwordChangedAt' is available, it returns true if the change
 * occurred after the provided timestamp, otherwise false.
 */
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

/**
 * Method to compare a candidate password with the user's hashed password.
 * @param {string} candidatePassword - Candidate password to compare.
 * @param {string} userPassword - User's hashed password stored in the database.
 * @returns {boolean} - True if the candidate password matches the user's password, false otherwise.
 *
 * This method compares a candidate password with the user's hashed password
 * to determine if they match. It uses bcrypt's compare function to securely
 * compare the candidate password with the hashed password retrieved from the database.
 * Returns true if the passwords match, indicating a correct password, and false otherwise.
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Method to generate and set a password reset token for the user.
 * @returns {string} - The generated password reset token.
 *
 * This method generates a random token, hashes it using SHA-256 algorithm,
 * and sets it as the password reset token for the user. It also sets the
 * expiration time for the token to 10 minutes from the current time.
 * Returns the generated password reset token.
 */
userSchema.methods.createPasswordResetToken = function () {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and set it as the password reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set the expiration time for the token, 10 minutes.
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Create the User model based on the userSchema
const User = mongoose.model('User', userSchema);
module.exports = User;
