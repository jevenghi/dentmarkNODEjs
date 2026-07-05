const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(userEmail) {
    this.to = userEmail;
    this.from = 'Dentmarker App <info@crateofrare.com>';
  }

  async send(subject, message, attachments = []) {
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
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
      attachments: attachments.length > 0 ? attachments : undefined,
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
    from: 'Dentmarker App <info@crateofrare.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transport.sendMail(mailOptions);
};

module.exports = Email;
