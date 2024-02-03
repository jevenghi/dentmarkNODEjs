const fs = require('fs');

const userData = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`));

exports.getAllCustomers = (req, res) => {
  const allCustomers = Array.from(new Set(userData.map((obj) => obj.customer)));
  res.status(200).json({
    status: 'success',
    data: { allCustomers },
  });
};

exports.getAllTasks = (req, res) => {
  //   const allTasks = userData.filter((el) => el.customer === req.params.customer);
  res.status(200).json({
    status: 'success',
    data: { userData },
  });
};

exports.getCustomer = (req, res) => {
  const userArray = userData.filter((el) => el.customer === req.params.id);
  if (!userArray.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: userArray,
  });
};
