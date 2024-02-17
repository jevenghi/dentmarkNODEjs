const catchAsyncErr = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');
const RequestQueryHandler = require('../utils/requestQueryHandler');

exports.getOne = (Model, popOptions) =>
  catchAsyncErr(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsyncErr(async (req, res) => {
    const updatedTask = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({
      status: 'success',
      data: { task: updatedTask },
    });
  });

exports.getAll = (Model) =>
  catchAsyncErr(async (req, res, next) => {
    const requestQueries = new RequestQueryHandler(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await requestQueries.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });
