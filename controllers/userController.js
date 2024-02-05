const Task = require('../models/taskModel');

exports.sendTask = async (req, res) => {
  const newTask = await Task.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newTask,
  });
};
