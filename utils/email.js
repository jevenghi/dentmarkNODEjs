const nodemailer = require('nodemailer');

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
    from: 'Dentmark App <admin@app.nl>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transport.sendMail(mailOptions);
};

module.exports = sendMail;
