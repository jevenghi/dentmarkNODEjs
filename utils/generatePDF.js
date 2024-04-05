// const { PDFDocument } = require('pdf-lib');

// const pdf = require('html-pdf');

// const fs = require('fs');
// const pug = require('pug');

// const generatePDF = async (data) => {
//   const templatePath = './views/allUsersReport.pug';
//   const compiledTemplate = pug.compileFile(templatePath);
//   const htmlContent = compiledTemplate(data);
//   return new Promise((resolve, reject) => {
//     pdf.create(htmlContent).toBuffer((err, buffer) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(buffer);
//       }
//     });
//   });
// };

// module.exports = generatePDF;
// const PdfPrinter = require('pdfmake');
// const fs = require('fs');

// const fonts = {
//   Roboto: {
//     normal: 'public/fonts/Roboto-Regular.ttf',
//     bold: 'public/fonts/Roboto-Medium.ttf',
//     italics: 'public/fonts/Roboto-Italic.ttf',
//     bolditalics: 'public/fonts/Roboto-MediumItalic.ttf',
//   },
// };
// const printer = new PdfPrinter(fonts);

// const docDefinition = {
//   content: [
//     {
//       layout: 'lightHorizontalLines', // optional
//       table: {
//         // headers are automatically repeated if the table spans over multiple pages
//         // you can declare how many rows should be treated as headers
//         headerRows: 1,
//         widths: ['*', 'auto', 100, '*'],

//         body: [
//           ['First', 'Second', 'Third', 'The last one'],
//           ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
//           [{ text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4'],
//         ],
//       },
//     },
//   ],
// };

// const options = {
//   // ...
// };
// const generatePDF = () => {
//   const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
//   pdfDoc.pipe(fs.createWriteStream('document.pdf'));
//   pdfDoc.end();
// };

// module.exports = generatePDF;
