const express = require('express');
const app = express();
const fs = require('fs');
const morgan = require('morgan');

const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/admin', adminRouter);
app.use('/', userRouter);

module.exports = app;
