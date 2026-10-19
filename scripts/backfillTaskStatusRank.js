const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const backfillTaskStatusRank = async () => {
  if (!process.env.DATABASE) {
    throw new Error('DATABASE is not defined in config.env');
  }

  await mongoose.connect(process.env.DATABASE);

  const result = await mongoose.connection.collection('tasks').updateMany(
    {},
    [
      {
        $set: {
          statusRank: {
            $switch: {
              branches: [
                { case: { $eq: ['$taskStatus', 'open'] }, then: 1 },
                { case: { $eq: ['$taskStatus', 'in-progress'] }, then: 2 },
                { case: { $eq: ['$taskStatus', 'pending'] }, then: 3 },
                { case: { $eq: ['$taskStatus', 'complete'] }, then: 4 },
              ],
              default: 1,
            },
          },
        },
      },
    ],
  );

  console.log(
    `Backfilled task status ranks. Matched: ${result.matchedCount}, modified: ${result.modifiedCount}`,
  );
};

backfillTaskStatusRank()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
