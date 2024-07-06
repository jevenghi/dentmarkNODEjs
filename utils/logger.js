const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

// logger.info('What rolls down stairs');
// logger.info('alone or in pairs,');
// logger.info('and over your neighbors dog?');
// logger.warn('Whats great for a snack,');
// logger.info('And fits on your back?');
// logger.error('Its log, log, log');

// const logDirectory = '/var/log/your-app-name';

// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.File({
//       filename: path.join(logDirectory, 'app.log'),
//       format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.json(),
//       ),
//     }),
//   ],
// });

module.exports = logger;
