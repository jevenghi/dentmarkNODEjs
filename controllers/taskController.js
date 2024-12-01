/* eslint-disable no-plusplus */
const generatePDF = require('../utils/generatePDF');
const sharp = require('sharp');
const User = require('../models/userModel');
const Task = require('../models/taskModel');
const Dent = require('../models/dentModel');
const RequestQueryHandler = require('../utils/requestQueryHandler');
const InvoiceCounter = require('../models/invoiceCounter');
const catchAsyncErr = require('../utils/catchAsyncError');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const multer = require('multer');
const sendMail = require('../utils/email');
const Email = require('../utils/email');
const he = require('he');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const slugify = require('slugify');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/pics/tasks');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only images can be uploaded', 400));
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTaskPhotos = upload.fields([{ name: 'images', maxCount: 5 }]);

exports.resizeTaskPhotos = catchAsyncErr(async (req, res, next) => {
  if (!req.files.images) {
    return next();
  }
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `user-${req.user.id}-${Date.now()}-${i + 1}.png`;
      await sharp(file.buffer)
        .resize(1000)
        .toFormat('png')
        .png({ quality: 90 })
        .toFile(`public/pics/tasks/${filename}`);
      req.body.images.push(filename);
    }),
  );
  next();
});
// Counts occurrences of dents' 'length' and 'paintDamaged' values
// to use it for determining task's difficulty
const accumulateValues = function (arr) {
  return arr.reduce((acc, nestedArray) => {
    nestedArray.forEach((el) => {
      acc[el.length] = (acc[el.length] || 0) + 1;
      acc[el.paintDamaged] = (acc[el.paintDamaged] || 0) + 1;
    });
    return acc;
  }, {});
};

// Determines task's difficulty level
const calcTaskDifficulty = function (obj) {
  if (obj.big && obj.yes) return 'difficult';
  if (obj.medium && obj.yes) return 'medium';
  return 'easy';
};

// exports.getAllCustomerNames = async (req, res) => {
//   try {
//     const customerNames = await Task.find({}).select('user');

//     if (customerNames.length === 0) {
//       res.status(404).json({
//         status: 'fail',
//         message: 'No customers found',
//       });
//     } else {
//       res.status(200).json({
//         status: 'success',
//         data: { customerNames },
//       });
//     }
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       message: err.message,
//     });
//   }
// };

//WITH FACTORY HANDLER
// exports.getAllTasks = factory.getAll(Task);

//for role based queries
exports.getAllTasks = catchAsyncErr(async (req, res, next) => {
  let requestQueries;
  let totalDocCount;

  if (req.user.role === 'user') {
    requestQueries = new RequestQueryHandler(
      Task.find({ user: req.user.id }),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    totalDocCount = await Task.countDocuments({ user: req.user.id });
  }

  if (req.user.role === 'admin') {
    requestQueries = new RequestQueryHandler(Task.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    totalDocCount = await Task.countDocuments();
  }

  const tasks = await requestQueries.query;

  res.status(200).json({
    status: 'success',
    tasks,
    totalTasks: totalDocCount,
  });
});

exports.getTask = factory.getOne(Task, { path: 'user', select: 'name' });

// exports.getTask = catchAsyncErr(async (req, res, next) => {
//   const currentTask = await Task.findById(req.params.id).populate({
//     path: 'user',
//     select: 'name',
//   });
//   if (!currentTask) {
//     return next(new AppError('No task found with that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: { currentTask },
//   });
// });

//ORIGINAL SEND TASK
exports.sendTask = catchAsyncErr(async (req, res, next) => {
  if (req.body.user && req.user.role === 'admin') {
    const customer = await User.findOne({ name: req.body.user });
    req.body.user = customer.id;
  } else {
    req.body.user = req.user.id;
  }
  req.body.carModel = he.decode(req.body.carModel);

  // const dentsValues = Object.values(req.body.dents);
  // const accValues = accumulateValues(dentsValues);
  // req.body.difficulty = calcTaskDifficulty(accValues);
  const { dents, ...taskData } = req.body;
  // console.log(dents); // Log the dents array

  // const formattedDents = dents.map((dentType) => dentType);

  // console.log(formattedDents);
  // const taskPayload = {
  //   ...taskData,
  //   dents: formattedDents,
  // };
  // req.body.images = JSON.parse(req.body.images);
  // req.body.dents = JSON.parse(req.body.dents);
  const newTask = await Task.create(req.body);
  req.newTask = newTask;

  res.status(201).json({
    status: 'success',
  });
  next();
});

// exports.addDentsToTask = catchAsyncErr(async (req, res, next) => {
//   const taskId = req.params.id;
//   try {
//     const task = await Task.findById(taskId);
//     if (!task)
//       return next(new AppError(`Task with this ID does not exist`, 404));

//     task.dents.push(...req.body.dents);
//     task.images = [...req.body.images];
//     await task.save();
//     req.taskId = taskId;
//     res.status(201).json({
//       status: 'success',
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err.response.data.message,
//     });
//   }
//   next();
// });
exports.addDentsToTask = catchAsyncErr(async (req, res, next) => {
  const taskId = req.params.id;
  try {
    const task = await Task.findById(taskId);
    if (!task)
      return next(new AppError(`Task with this ID does not exist`, 404));

    task.dents = [...req.body.dents];
    task.images = [...req.body.images];
    await task.save();
    req.taskId = taskId;
    res.status(201).json({
      status: 'success',
    });
  } catch (err) {
    console.log(err);
    return next(new AppError(err, 404));
  }
  next();
});

exports.updateTask = factory.updateOne(Task);

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task)
      return next(new AppError(`Task with this ID does not exist`, 404));

    if (task.user.id === req.user.id || req.user.role === 'admin') {
      await task.deleteOne();
      // Status 200 or 204?
      res.status(200).json({
        status: 'success',
        message: 'Task succesfully deleted',
      });
    } else {
      return next(
        new AppError('Only task creator or an admin can delete the task.', 403),
      );
    }
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
// exports.getTaskStats = async (req, res) => {
//   try {
//     const stats = await Task.aggregate([
//       {
//         $match: { difficulty: { $gte: 1 } },
//       },
//       {
//         $group: {
//           _id: '$user',
//           numTasks: { $sum: 1 },
//           avgDifficulty: { $avg: '$difficulty' },
//         },
//       },
//       {
//         $sort: { avgDifficulty: 1 },
//       },
//     ]);
//     res.status(200).json({
//       status: 'success',
//       message: { stats },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };

exports.updateDents = catchAsyncErr(async (req, res, next) => {
  const taskId = req.params.id;

  if (req.body.carModel) {
    req.body.carModel = he.decode(req.body.carModel);
  }

  const { cost, taskStatus, remark, carModel } = req.body;
  if (req.user.role === 'admin') {
    if (cost) {
      await Task.findByIdAndUpdate(taskId, { totalCost: cost });
    }
    if (taskStatus) {
      if (taskStatus === 'pending' || taskStatus === 'complete') {
        const completeDate = Date.now();
        await Task.findByIdAndUpdate(taskId, { completedAt: completeDate });
      }
      await Task.findByIdAndUpdate(taskId, { taskStatus });
    }
    if (remark) {
      await Task.findByIdAndUpdate(taskId, { remark });
    }
  }

  if (carModel) {
    await Task.findByIdAndUpdate(taskId, { carModel });
  }

  res.status(201).json({
    status: 'success',
  });
});

exports.generateUserReport = catchAsyncErr(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
  });
});

exports.generateAdminReport = catchAsyncErr(async (req, res, next) => {
  const { status, from, to } = req.query;
  try {
    let matchStage = {}; // Default empty match stage

    if (status) {
      matchStage = { taskStatus: status };
    }
    const tasks = await Task.find(matchStage).sort({
      createdAt: -1,
    });
    const totalCostAggregate = await Task.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: null,
          totalCost: { $sum: '$totalCost' },
        },
      },
      // {
      //   $project: {
      //     _id: 0,
      //     totalCost: 1,
      //   },
      // },
    ]);
    // const pdf = await generatePDF({ tasks, totalCostAggregate });
    // const pdf = generatePDF();

    // res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    // res.setHeader('Content-Type', 'application/pdf');
    // res.send(pdf);
    res.status(200).json({
      status: 'success',
      tasks,
    });
    // Create PDF
  } catch (err) {
    console.error('Error generating PDF:', err);
    return next(new AppError(`Error generating PDF`, 500));
  }
});
exports.sendTaskCreationEmail = async (req, res, next) => {
  try {
    const taskId = req.newTask.id;

    const task = await Task.findById(taskId);
    const userName = task.user.name;

    const subject = 'New Task submitted';
    const message = `${userName} has submitted new task: ${req.protocol}://${req.get('host')}/tasks/${taskId}`;

    const email = new Email(process.env.EMAIL_ADMIN);
    // const email = new Email('jevenghi@gmail.com');

    await email.send(subject, message);
  } catch (error) {
    console.error('Error sending task creation email:', error);
    // You might choose to respond with an error here
    // res.status(500).json({ error: 'Failed to send task creation email' });
  }
};
exports.sendTaskChangeEmail = async (req, res, next) => {
  try {
    const { taskId } = req;

    const task = await Task.findById(taskId);
    const userName = task.user.name;

    const subject = 'Changes made to task';
    const message = `${userName} has made changes to task: ${req.protocol}://${req.get('host')}/tasks/${taskId}`;

    const email = new Email(process.env.EMAIL_ADMIN);
    // const email = new Email('jevenghi@gmail.com');

    await email.send(subject, message);
  } catch (error) {
    console.error('Error sending task change email:', error);
    // You might choose to respond with an error here
    // res.status(500).json({ error: 'Failed to send task creation email' });
  }
};

exports.updateStatusBulk = async (req, res, next) => {
  try {
    const { selectedTasks, updatedStatus } = req.body;

    if (req.user.role === 'admin') {
      if (!Array.isArray(selectedTasks) || !updatedStatus) {
        return res.status(400).json({ message: 'Invalid input' });
      }

      await Task.updateMany(
        { _id: { $in: selectedTasks } },
        { $set: { taskStatus: updatedStatus } },
      );
      res.status(201).json({
        status: 'success',
        message: 'Status updated',
      });
    }
  } catch (error) {
    console.error('Error bulk updating status:', error);
    return next(new AppError(`Error updating status`, 500));
    // You might choose to respond with an error here
    // res.status(500).json({ error: 'Failed to send task creation email' });
  }
};

function getDateFormatted(daysToAdd) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);

  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getFullYear()}`;
}

// const fillInvoiceTemplate = async (invoiceData) => {
//   try {
//     let startCell = 19;
//     const invoiceDate = getDateFormatted(0);
//     const expireDate = getDateFormatted(30);

//     const workbook = new ExcelJS.Workbook();
//     const templatePath = path.resolve(__dirname, '../invoice-template.xlsx');

//     await workbook.xlsx.readFile(templatePath);

//     const worksheet = workbook.getWorksheet(1);
//     worksheet.getCell('A16').value = invoiceDate;
//     worksheet.getCell('F16').value = expireDate;

//     invoiceData.forEach((task) => {
//       worksheet.getCell(`A${startCell}`).value = task.completeDate;
//       worksheet.getCell(`B${startCell}`).value = task.carModel;
//       worksheet.getCell(`G${startCell}`).value = task.cost;
//       startCell++;
//     });

//     const customerName = invoiceData[0].customer.name;
//     const excelFileName = `invoice_${customerName}.xlsx`;

//     await workbook.xlsx.writeFile(excelFileName);

//     return { customerName, excelFileName };
//   } catch (error) {
//     console.error('Error creating invoice:', error);
//   }
// };
async function generateInvoiceNumber() {
  const currentYear = new Date().getFullYear();
  const yearPrefix = currentYear.toString().slice(-2);

  const invoiceCounter = await InvoiceCounter.findOneAndUpdate(
    { year: currentYear },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const invoiceNumber = `${yearPrefix}${String(invoiceCounter.counter).padStart(3, '0')}`;
  return invoiceNumber;
}

exports.generatePDF = async (req, res, next) => {
  try {
    const { invoiceData } = req;

    if (!invoiceData || invoiceData.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No data to generate invoice',
      });
    }

    // if (!invoiceData[0].invoiceAddress.invoiceCustomerName) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'No address data available to generate invoice',
    //   });
    // }

    let itemNumber = 1;
    // const invoiceNumber = await generateInvoiceNumber();

    const templatePath = path.resolve(__dirname, '../invoice-template.pdf');
    const existingPdfBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    const dateField = form.getTextField('invoice-date');
    const invoiceExpiryField = form.getTextField('invoice-expiry');
    const totalExclBtwField = form.getTextField('total-excl');
    const totalBtwField = form.getTextField('total-btw');
    const totalInclBtwField = form.getTextField('total-incl');
    const customerNameField = form.getTextField('customer-name');
    const customerStreetHouseField = form.getTextField('street-house');
    const customerPostcodeCityField = form.getTextField('postcode-city');
    const customerEmailField = form.getTextField('email');
    // const invoiceNumberField = form.getTextField('invoice-nr');

    const invoiceDate = getDateFormatted(0);
    const invoiceExpireDate = getDateFormatted(30);
    const customer = invoiceData[0].invoiceAddress.invoiceCustomerName;

    const totalExclBtw = invoiceData.reduce((acc, curr) => acc + curr.cost, 0);
    const totalBtw = ((totalExclBtw * 21) / 100).toFixed(2).replace('.', ',');
    const totalInclBtw = (totalExclBtw + parseFloat(totalBtw.replace(',', '.')))
      .toFixed(2)
      .replace('.', ',');

    // invoiceNumberField.setText(invoiceNumber);
    dateField.setText(invoiceDate);
    invoiceExpiryField.setText(invoiceExpireDate);
    totalExclBtwField.setText(String(totalExclBtw));
    totalBtwField.setText(String(totalBtw));
    totalInclBtwField.setText(String(totalInclBtw));
    customerNameField.setText(customer);
    customerStreetHouseField.setText(invoiceData[0].invoiceAddress.streetHouse);
    customerPostcodeCityField.setText(
      invoiceData[0].invoiceAddress.postCodeCity,
    );
    customerEmailField.setText(invoiceData[0].invoiceAddress.emailAddress);

    invoiceData.forEach((item) => {
      form
        .getTextField(`complete-date-${itemNumber}`)
        .setText(item.completeDate);
      form.getTextField(`description-${itemNumber}`).setText(item.carModel);
      form.getTextField(`cost-${itemNumber}`).setText(String(item.cost));
      itemNumber++;
    });

    // form.flatten();

    // const pdfBytes = await pdfDoc.save();
    // fs.writeFileSync(`${customer}-${invoiceDate}-invoice.pdf`, pdfBytes);

    // res.status(200).json({ status: 'success' });
    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${customer}.pdf"`,
    );

    res.status(200).send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Error generating invoice:', err);
    next(new AppError('Error generating invoice', 500));
  }
};

exports.getInvoiceData = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const lastInvoiceNumber = await generateInvoiceNumber();
      const { selectedTasks } = req.body;
      if (!Array.isArray(selectedTasks)) {
        return res.status(400).json({ message: 'Invalid input' });
      }

      const tasks = await Task.find({ _id: { $in: selectedTasks } });

      req.invoiceData = tasks.map((task) => ({
        invoiceAddress: task.user.invoiceAddress,
        carModel: task.carModel,
        cost: task.totalCost,
        completeDate: task.completedAt
          ? `${String(task.completedAt.getDate()).padStart(2, '0')}-${String(task.completedAt.getMonth() + 1).padStart(2, '0')}-${task.completedAt.getFullYear()}`
          : null,
      }));

      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    next(new AppError('Error fetching invoice data', 500));
  }
};

exports.getDataForInvoice = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const lastInvoiceNumber = await generateInvoiceNumber();

      const { selectedTasks } = req.body;
      if (!Array.isArray(selectedTasks)) {
        return res.status(400).json({ message: 'Invalid input' });
      }

      const tasks = await Task.find({ _id: { $in: selectedTasks } });

      const fetchedInvoiceData = tasks.map((task) => ({
        invoiceAddress: task.user.invoiceAddress,
        carModel: task.carModel,
        cost: task.totalCost,
        completeDate: task.completedAt
          ? `${String(task.completedAt.getDate()).padStart(2, '0')}-${String(task.completedAt.getMonth() + 1).padStart(2, '0')}-${task.completedAt.getFullYear()}`
          : null,
      }));

      res.status(200).json({
        status: 'success',
        fetchedInvoiceData,
        lastInvoiceNumber,
      });
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    next(new AppError('Error fetching invoice data', 500));
  }
};

exports.generateAndSendPDF = async (req, res, next) => {
  try {
    const {
      invoiceData,
      totalExcl,
      btw,
      totalIncl,
      newInvoiceNumber,
      invoiceCreateDate,
      invoiceExpiryDate,
    } = req.body;

    if (!invoiceData || invoiceData.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No data to generate invoice',
      });
    }

    let itemNumber = 1;
    // const invoiceNumber = await generateInvoiceNumber();

    const templatePath = path.resolve(__dirname, '../invoice-template.pdf');
    const existingPdfBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    const dateField = form.getTextField('invoice-date');
    const invoiceExpiryField = form.getTextField('invoice-expiry');
    const totalExclBtwField = form.getTextField('total-excl');
    const totalBtwField = form.getTextField('total-btw');
    const totalInclBtwField = form.getTextField('total-incl');
    const customerNameField = form.getTextField('customer-name');
    const customerStreetHouseField = form.getTextField('street-house');
    const customerPostcodeCityField = form.getTextField('postcode-city');
    const customerEmailField = form.getTextField('email');
    // const invoiceNumberField = form.getTextField('invoice-nr');

    const customer = invoiceData[0].invoiceAddress.invoiceCustomerName;

    // invoiceNumberField.setText(invoiceNumber);
    dateField.setText(invoiceCreateDate);
    invoiceExpiryField.setText(invoiceExpiryDate);
    totalExclBtwField.setText(totalExcl);
    totalBtwField.setText(btw);
    totalInclBtwField.setText(totalIncl);
    customerNameField.setText(customer);
    customerStreetHouseField.setText(invoiceData[0].invoiceAddress.streetHouse);
    customerPostcodeCityField.setText(
      invoiceData[0].invoiceAddress.postCodeCity,
    );
    customerEmailField.setText(invoiceData[0].invoiceAddress.emailAddress);

    invoiceData.forEach((item) => {
      form
        .getTextField(`complete-date-${itemNumber}`)
        .setText(item.completeDate);
      form.getTextField(`description-${itemNumber}`).setText(item.carModel);
      form.getTextField(`cost-${itemNumber}`).setText(String(item.cost));
      itemNumber++;
    });

    form.flatten();

    // const pdfBytes = await pdfDoc.save();
    // fs.writeFileSync(`${customer}-${invoiceDate}-invoice.pdf`, pdfBytes);

    // res.status(200).json({ status: 'success' });
    const pdfBytes = await pdfDoc.save();

    const currentYear = new Date().getFullYear();
    await InvoiceCounter.findOneAndUpdate(
      { year: currentYear },
      { counter: Number(newInvoiceNumber.slice(-3)) },
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${newInvoiceNumber} ${customer}.pdf"`,
    );

    res.status(200).send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Error generating invoice:', err);
    next(new AppError('Error generating invoice', 500));
  }
};
