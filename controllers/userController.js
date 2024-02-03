const fs = require('fs');
const userData = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`));

exports.checkFields = (req, res, next) => {
  if (!req.body.customer || !req.body.model) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or model',
    });
  }
  next();
};

exports.sendTask = (req, res) => {
  console.log(req.body.customer);

  userData.push(req.body);
  fs.writeFile(`./data.json`, JSON.stringify(userData), (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    } else {
      res.status(201).json({
        status: 'success',
        results: userData.length,
      });
    }
  });
};
