const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
let Client = require('ssh2-sftp-client');
const fs = require('fs');

const catchAsyncErr = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

// const AWS = require('aws-sdk');

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_SECRET_KEY,
//   region: process.env.AWS_BUCKET_REGION,
// });

// const s3 = new AWS.S3();

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
exports.uploadTaskPhotos = upload.fields([{ name: 'images', maxCount: 10 }]);

exports.resizeTaskPhotos = catchAsyncErr(async (req, res, next) => {
  const imageNames = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `user-${req.user.id}-${Date.now()}-${i + 1}.png`;

      //FOR ROTATING VERTICAL IMAGES
      const metadata = await sharp(file.buffer).metadata();

      // if (isPortrait) {
      //   await sharp(file.buffer)
      //     // .rotate(90)
      //     .rotate()
      //     .resize(1000, null, { fit: 'contain' })
      //     .toFormat('png')
      //     .png({ quality: 70 })
      //     .toFile(`public/pics/tasks/${filename}`);
      // } else {
      //   await sharp(file.buffer)
      //     .resize(1000, null, { fit: 'contain' })
      //     .toFormat('png')
      //     .png({ quality: 70 })
      //     .toFile(`public/pics/tasks/${filename}`);
      // }
      let image = sharp(file.buffer);

      if (metadata.orientation) {
        image = image.rotate();
        await image
          .resize(1000, null, { fit: 'contain' })
          .toFormat('png')
          .png({ quality: 70 })
          .toFile(`public/pics/tasks/${filename}`);
      } else {
        await image
          .resize(1000, null, { fit: 'contain' })
          .toFormat('png')
          .png({ quality: 70 })
          .toFile(`public/pics/tasks/${filename}`);
      }

      imageNames.push(filename);
    }),
  );
  //   req.imageNames = imageNames;
  res.status(201).json({
    status: 'success',
    imageNames,
  });
});

exports.transferFiles = catchAsyncErr(async (req, res, next) => {
  const remoteDirectory = '/home/tasks';

  const config = {
    host: process.env.VPS_HOST,
    port: process.env.VPS_PORT,
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
  };
  const client = new Client();

  try {
    await client.connect(config);
    await Promise.all(
      req.body.images.map(async (file) => {
        // const localFilePath = path.resolve(localDirectory, file);
        const localFilePath = `public/pics/tasks/${file}`;

        const remote = path.posix.join(remoteDirectory, file);

        await client.put(localFilePath, remote);
      }),
    );

    client.end();
    // res.status(201).json({ status: 'success' });
  } catch (err) {
    //TODO: handle returned errors
    console.error('SFTP Error:', err);
    return res.status(500).json({ error: 'Error transferring files' });
  }
  next();
});

exports.getImageDataURI = catchAsyncErr(async (req, res, next) => {
  const imagesBase64 = [];
  await Promise.all(
    // eslint-disable-next-line array-callback-return
    req.body.images.map((image) => {
      const imagePath = `public/pics/tasks/${image}`;
      const imageContent = fs.readFileSync(imagePath, 'base64');
      imagesBase64.push(imageContent);
    }),
  );

  res.status(200).json({
    status: 'success',
    imagesBase64,
  });
});
