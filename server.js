const mongoose = require('mongoose');
const dotenv = require('dotenv');

// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 3000;

// const DB = process.env.DATABASE;
// mongoose.connect(DB).then();

// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

// process.on('unhandledRejection', (err) => {
//   console.log(err.name, err.message);
//   console.log('UNHANDLED REJECTION! 🔴 Shutting Down...');
//   server.close(() => {
//     process.exit(1);
//   });
// });
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

//Connect to the database before listening
connectDB().then(() => {
  app.listen(port, () => {
    console.log('listening for requests');
  });
});
