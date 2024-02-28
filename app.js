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

const authRouter = require('./routes/authRoutes');
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

const authLimiter = rateLimit({
  max: 15,
  windowMs: 60 * 60 * 1000,
  message: {
    message: 'Too many requests from this IP, please try again in one hour.',
  },
});

const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  data: {
    message: 'Too many requests from this IP, please try again in one hour.',
  },
});

function checkLimit(req, res, next) {
  console.log(req.rateLimit);
  if (req.rateLimit.remaining === 0) {
    return res
      .status(429)
      .json({ message: 'Rate limit exceeded. Please try again later.' });
  }
  next();
}

app.use('/api/v1/auth/login', authLimiter);
// app.use('/api/v1/auth/forgotPassword', authLimiter);
app.use('/api', limiter);
// app.use('/', checkLimit);

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
app.use((req, res, next) => {
  console.log(res.statusCode);
  next();
});
// app.get('/tasks', (req, res) => {
//   res.status(200).render('tasks');
// });

// app.use('/overview', viewRouter);
app.use('/', viewRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);
module.exports = app;
