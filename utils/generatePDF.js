const { PDFDocument } = require('pdf-lib');

const pdf = require('html-pdf');

const fs = require('fs');
const pug = require('pug');

const generatePDF = async (data) => {
  const templatePath = './views/allUsersReport.pug';
  const compiledTemplate = pug.compileFile(templatePath);
  const htmlContent = compiledTemplate(data);
  return new Promise((resolve, reject) => {
    pdf.create(htmlContent).toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
};

module.exports = generatePDF;
