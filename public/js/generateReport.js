import { showAlert } from './alerts.js';
import axios from 'axios';
import { translations } from './translations.js';
import ExcelJS from 'exceljs';

const pdfFonts = require('pdfmake/build/vfs_fonts.js');
const pdfMake = require('pdfmake/build/pdfmake.js');

pdfMake.vfs = pdfFonts.pdfMake.vfs;

// export const generatePDF = async () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const status = urlParams.get('taskStatus');
//   const from = urlParams.get('from');
//   const to = urlParams.get('to');

//   try {
//     const res = await axios({
//       method: 'GET',
//       url: '/api/v1/tasks/generate-admin-report',
//       params: { status, from, to },
//       responseType: 'blob',
//     });
//     // if (res.data.status === 'success') {
//     //   console.log(res);
//     // } else {
//     //   showAlert('error', res.data.message);
//     // }
//     const blob = new Blob([res.data], { type: 'application/pdf' });

//     // Create a URL for the blob object
//     const url = window.URL.createObjectURL(blob);

//     // Create a link element
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', 'report.pdf');

//     // Append the link to the document body
//     document.body.appendChild(link);

//     // Programmatically trigger the click event on the link to start the download
//     link.click();

//     // Cleanup: remove the link and revoke the URL
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     showAlert('error', err);
//     console.log(err);
//     // alert(err.response.data.message);
//   }
// };

// const fonts = {
//   Roboto: {
//     normal: 'fonts/Roboto-Regular.ttf',
//     bold: 'fonts/Roboto-Medium.ttf',
//     italics: 'fonts/Roboto-Italic.ttf',
//     bolditalics: 'fonts/Roboto-MediumItalic.ttf',
//   },
// };

const getFilteredResults = async () => {
  const query = window.location.search ? window.location.search : '?';
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/tasks${query}&limit=1000`,
    });
    if (res.data.status === 'success') {
      const result = res.data.tasks.map((task) => [
        task.user.name,
        task.carModel,
        task.taskStatus,
        task.totalCost,
        new Date(task.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        task.completedAt
          ? new Date(task.completedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })
          : '',
        task.remark,
      ]);
      return result;
    } else {
      return showAlert('error', res.data.message);
    }
  } catch (err) {
    return showAlert('error', err);
  }
};

export const generatePDF = async () => {
  let filteredResults = await getFilteredResults();
  filteredResults = filteredResults.map((row) => row.slice(0, -1));

  const totalSum = filteredResults.reduce((acc, curr) => acc + curr[3], 0);
  const totalAmountTasks = filteredResults.length;
  const from =
    filteredResults[filteredResults.length - 1][
      filteredResults[filteredResults.length - 1].length - 2
    ];
  const to = filteredResults[0][filteredResults[0].length - 2];

  const docDefinition = {
    content: [
      { text: `Period: ${from} t/m ${to}`, style: 'subheader' },
      `Submitted tasks: ${totalAmountTasks}`,

      {
        layout: 'lightHorizontalLines',
        style: 'table',
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],

          body: [
            [
              'Customer',
              'Vehicle Model',
              'Status',
              'Cost',
              'Created',
              'Completed',
            ],
            ...filteredResults,
            [
              { text: 'TOTAL', bold: true },
              '',
              '',
              { text: totalSum, bold: true },
              '',
              '',
            ],
          ],
        },
      },
    ],
    documentTitle: `summary${from}${to}.pdf`,
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      table: {
        margin: [0, 5, 10, 15],
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black',
      },
    },
  };
  const fileName = `summary_${from}_to_${to}.pdf`;
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    pdfMake.createPdf(docDefinition).download(fileName);
  } else {
    pdfMake.createPdf(docDefinition).open(fileName);
  }
};

// export const generateTaskPDF = (images) => {
//   const docDefinition = {
//     content: [],
//   };

//   images.forEach((imageName) => {
//     console.log(imageName);
//     const imagePath = `D:/jsProjects/krasmarkNODE/public/pics/tasks/${imageName}`;

//     docDefinition.content.push({
//       image: imagePath,
//       width: 500,
//     });
//   });

//   pdfMake.createPdf(docDefinition).download();
// };
export const generateTaskPDF = async (images) => {
  const docDefinition = {
    content: [],
  };
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/photos/getDataURI`,
      data: { images },
    });
    if (res.data.status === 'success') {
      const imagesURIs = res.data.imagesBase64;
      imagesURIs.forEach((dataURI) => {
        docDefinition.content.push({
          image: `data:image/png;base64,${dataURI}`,
          width: 500,
        });
      });
      pdfMake.createPdf(docDefinition).download();
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error making the report');
  }
};

export const generateExcel = async () => {
  const filteredResults = await getFilteredResults();
  // const from =
  //   filteredResults[filteredResults.length - 1][
  //     filteredResults[filteredResults.length - 1].length - 2
  //   ];
  // const to = filteredResults[0][filteredResults[0].length - 2];
  const dateColumnIndex = 4; // Assuming 'Created' is now the 5th column (index 4)

  const from = filteredResults[filteredResults.length - 1][dateColumnIndex];
  const to = filteredResults[0][dateColumnIndex];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Summary');

  worksheet.addRow([
    'Customer',
    'Vehicle Model',
    'Status',
    'Cost',
    'Created',
    'Completed',
    'Notes',
  ]);

  filteredResults.forEach((row) => {
    worksheet.addRow(row);
  });

  worksheet.columns = [
    { width: 20 },
    { width: 15 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 20 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `summary_${from}_${to}.xlsx`;
  link.click();

  URL.revokeObjectURL(link.href);
};

export const generateInvoice = async (selectedTasks) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tasks/get-invoice-data`,
      data: { selectedTasks },
      responseType: 'blob',
    });

    const contentDisposition = res.headers['content-disposition'];
    let filename = 'invoice.pdf';

    if (contentDisposition && contentDisposition.includes('filename=')) {
      filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
    }

    const file = new Blob([res.data], { type: 'application/pdf' });
    const fileURL = window.URL.createObjectURL(file);

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      window.open(fileURL, '_blank');
    } else {
      const downloadLink = document.createElement('a');
      downloadLink.href = fileURL;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }

    setTimeout(() => {
      window.URL.revokeObjectURL(fileURL);
    }, 100);

    location.reload();
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
