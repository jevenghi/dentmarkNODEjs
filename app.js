const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express();
const morgan = require('morgan');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

const taskRouter = require('./routes/taskRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

//SET SECURITY HTTP HEADERS
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//LIMIT REQUESTS NUMBER FROM ONE IP PER HOUR
const limiter = rateLimit({
  max: 150,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again on one hour.',
});

app.use('/api', limiter);

//BODY PARSER, CONVERTING BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

//DATA SANITIZATION AGAINST XSS
app.use(xss());

//PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: ['difficulty', 'user'],
  }),
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// app.get('/tasks', (req, res) => {
//   res.status(200).render('tasks');
// });

app.use('/overview', viewRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);
module.exports = app;
