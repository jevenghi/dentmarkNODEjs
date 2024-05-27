const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(userEmail) {
    this.to = userEmail;
    this.from = 'Dentmarker App <info@am-place.com>';
  }

  async send(subject, message) {
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text: message,
      // html: can be added if needed
    };

    await transport.sendMail(mailOptions);
  }
}

const sendMail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Dentmarker App <info@am-place.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transport.sendMail(mailOptions);
};

module.exports = Email;
