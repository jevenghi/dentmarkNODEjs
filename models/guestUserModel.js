const mongoose = require('mongoose');
const validator = require('validator');

const getNameFromEmail = (emailAddress = '') => {
  const [localPart, domain = ''] = emailAddress.trim().toLowerCase().split('@');
  const domainWithoutExtension = domain.split('.').slice(0, -1).join(' ');

  return [localPart, domainWithoutExtension].filter(Boolean).join(' ');
};

const guestUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    emailAddres: {
      type: String,
      required: [true, 'Please provide a valid e-mail address'],
      lowercase: true,
      trim: true,
      alias: 'emailAddress',
      validate: [validator.isEmail, 'Please provide a valid e-mail address'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

guestUserSchema.pre('validate', function (next) {
  if (!this.name) {
    this.name = getNameFromEmail(this.emailAddres);
  }
  next();
});

const GuestUser = mongoose.model('GuestUser', guestUserSchema);
module.exports = GuestUser;
