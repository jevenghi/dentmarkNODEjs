const cron = require('node-cron');
const he = require('he');
const axios = require('axios');
const mongoose = require('mongoose');
const Task = require('../models/taskModel');
const ExcelJS = require('exceljs');
const Email = require('../utils/email');

const getTasks = async () => {
  try {
    // const now = new Date();

    // const dayOfWeek = now.getDay();

    // const previousSunday = new Date(now);
    // previousSunday.setDate(now.getDate() - dayOfWeek);
    // previousSunday.setHours(12, 0, 0, 0);

    // const currentSunday = new Date(now);
    // currentSunday.setDate(now.getDate() + (7 - dayOfWeek));
    // currentSunday.setHours(12, 0, 0, 0);

    // const tasks = await Task.find({
    //   createdAt: {
    //     $gte: previousSunday,
    //     $lt: currentSunday,
    //   },
    // });
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const tasks = await Task.find({
      createdAt: {
        $gte: startOfYear,
      },
    });

    const dataForExcel = tasks.map((task) => [
      task.user ? he.decode(task.user.name) : 'deleted',
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

    return dataForExcel;
  } catch (error) {
    console.error('Error during cron job execution:', error);
  }
};

const generateExcel = async () => {
  const data = await getTasks();
  // const from =
  //   filteredResults[filteredResults.length - 1][
  //     filteredResults[filteredResults.length - 1].length - 2
  //   ];
  // const to = filteredResults[0][filteredResults[0].length - 2];

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

  data.forEach((row) => {
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
  // const blob = new Blob([buffer], {
  //   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // });
  return buffer;
};

const sendScheduledEmail = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const buffer = await generateExcel();
    const subject = `Tasks ${startOfYear} - ${today}`;
    const message = `Summary of all tasks from ${startOfYear} to ${today}`;
    const attachment = {
      filename: `${currentYear}_all_tasks.xlsx`,
      content: buffer,
      encoding: 'base64',
    };

    const email = new Email(process.env.EMAIL_ADMIN);

    await email.send(subject, message, [attachment]);
  } catch (error) {
    console.error('Error sending scheduled email:', error);
  }
};

cron.schedule('20 2 * * 1', () => {
  sendScheduledEmail();
});
//   });
// } catch (err) {
//   console.log(err);
// }
// const currentYear = new Date().getFullYear();
// const startOfYear = new Date(currentYear, 0, 1);
// const formattedDate = startOfYear.toLocaleDateString('en-GB', {
//   day: '2-digit',
//   month: '2-digit',
//   year: 'numeric',
// });
// const today = new Date().toLocaleDateString('en-GB', {
//   day: '2-digit',
//   month: '2-digit',
//   year: 'numeric',
// });
// console.log(formattedDate, today);
