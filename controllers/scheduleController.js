const cron = require('node-cron');
const he = require('he');
const axios = require('axios');
const mongoose = require('mongoose');
const Task = require('../models/taskModel');
const ExcelJS = require('exceljs');
const Email = require('../utils/email');

const getTasks = async () => {
  try {
    const now = new Date();

    const dayOfWeek = now.getDay();

    const previousSunday = new Date(now);
    previousSunday.setDate(now.getDate() - dayOfWeek);
    previousSunday.setHours(12, 0, 0, 0);

    const currentSunday = new Date(now);
    currentSunday.setDate(now.getDate() + (7 - dayOfWeek));
    currentSunday.setHours(12, 0, 0, 0);

    const tasks = await Task.find({
      createdAt: {
        $gte: previousSunday,
        $lt: currentSunday,
      },
    });

    const dataForExcel = tasks.map((task) => [
      he.decode(task.user.name),
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
    const buffer = await generateExcel();
    const subject = 'Tasks summary';
    const message = 'Previous 7 days tasks summary report attached';
    const attachment = {
      filename: 'tasks_summary.xlsx',
      content: buffer,
      encoding: 'base64',
    };

    const email = new Email(process.env.EMAIL_ADMIN);

    await email.send(subject, message, [attachment]);
  } catch (error) {
    console.error('Error sending scheduled email:', error);
  }
};

cron.schedule('15 19 * * 5', () => {
  console.log('Cron job executed at 17:20 on Friday!');
  sendScheduledEmail();
});
