const AppError = require('../utils/appError');
const multer = require('multer');
const catchAsyncErr = require('../utils/catchAsyncError');
const sharp = require('sharp');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_BUCKET_REGION,
});

const s3 = new AWS.S3();

const multerStorage = multer.memoryStorage();
// const multerStorage = multer.diskStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only images can be uploaded', 400));
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTaskPhotos = upload.fields([{ name: 'images', maxCount: 5 }]);

exports.resizeTaskPhotos = catchAsyncErr(async (req, res, next) => {
  const imageNames = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `user-${req.user.id}-${Date.now()}-${i + 1}.png`;
      await sharp(file.buffer).resize(800).toFormat('png').png({ quality: 80 }).toFile(`public/pics/tasks/${filename}`);
      //   await sharp(file.buffer).resize(800).toFormat('png').png({ quality: 80 }).toFile(`136.243.235.198:0525/root/home/tasks/${filename}`);

      imageNames.push(filename);
    }),
  );
  res.status(201).json({
    status: 'success',
    images: imageNames,
  });
  //   next();
});
