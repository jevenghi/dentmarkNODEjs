const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
let Client = require('ssh2-sftp-client');
const fs = require('fs');
const slugify = require('slugify');

const catchAsyncErr = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');

// const multerStorage = multer.memoryStorage();
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/temp/uploads');
  },
  filename: (req, file, cb) => {
    const userName = slugify(req.user.name, { lower: true, strict: true });
    const ext = file.mimetype.split('/')[1];
    cb(null, `${userName}-${Date.now()}.${ext}`);
  },
});
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

exports.setGuestUploadUser = (req, res, next) => {
  req.user = { name: 'guest' };
  next();
};

exports.ensureUploadUser = (req, res, next) => {
  if (!req.user) {
    req.user = { name: 'guest' };
  }
  next();
};

// exports.resizeTaskPhotos = catchAsyncErr(async (req, res, next) => {
//   const imageNames = [];
//   try {
//     await Promise.all(
//       req.files.images.map(async (file, i) => {
//         const userName = slugify(req.user.name, { lower: true, strict: true });
//         const filename = `${userName}-${Date.now()}-${i + 1}.png`;

//         //FOR ROTATING VERTICAL IMAGES
//         const metadata = await sharp(file.buffer).metadata();

//         let image = sharp(file.buffer);

//         if (metadata.orientation && metadata.orientation !== 1) {
//           image = image.rotate();
//         }

//         await image
//           .resize({ width: 1000, fit: 'inside' }) // Resize while preserving aspect ratio
//           .toFormat('png')
//           .png({ quality: 70 })
//           .toFile(`public/pics/tasks/${filename}`);

//         delete file.buffer;
//         imageNames.push(filename);
//       }),
//     );
//     //   req.imageNames = imageNames;
//     res.status(201).json({
//       status: 'success',
//       imageNames,
//     });
//   } catch (err) {
//     console.error(err);
//     return next(new AppError('Error processing images', 500));
//   }
// });
exports.resizeTaskPhotos = catchAsyncErr(async (req, res, next) => {
  const imageNames = [];
  try {
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const userName = slugify(req.user.name, { lower: true, strict: true });
        const filename = `${userName}-${Date.now()}-${i + 1}.png`;

        // Load the file from the disk and process with Sharp
        let image = sharp(file.path);

        const metadata = await image.metadata();

        if (metadata.orientation && metadata.orientation !== 1) {
          image = image.rotate();
        }

        await image
          .resize({ width: 1000, fit: 'inside' }) // Resize while preserving aspect ratio
          .toFormat('png')
          .png({ quality: 70 })
          .toFile(`public/pics/tasks/${filename}`);

        imageNames.push(filename);

        // Optionally: delete the temp file after processing
        fs.unlinkSync(file.path);
      }),
    );
    res.status(201).json({
      status: 'success',
      imageNames,
    });
  } catch (err) {
    console.error(err);
    return next(new AppError('Error processing images', 500));
  }
});

exports.transferFiles = catchAsyncErr(async (req, res, next) => {
  const remoteDirectory = '/home/tasks';
  const remoteDirBackup = '/home/tasks_backup';

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
        const remoteBackup = path.posix.join(remoteDirBackup, file);

        await client.put(localFilePath, remote);
        await client.put(localFilePath, remoteBackup);
      }),
    );

    // res.status(201).json({ status: 'success' });
  } catch (err) {
    //TODO: handle returned errors
    console.error('SFTP Error:', err);
    // return res.status(500).json({ error: 'Error transferring files' });
    return next(new AppError('Error transferring files', 503));
  } finally {
    client.end();
  }
  next();
});

// exports.getImageDataURI = catchAsyncErr(async (req, res, next) => {
//   const imagesBase64 = [];
//   await Promise.all(
//     // eslint-disable-next-line array-callback-return
//     req.body.images.map(async (image) => {
//       const imagePath = `public/pics/tasks/${image}`;
//       // eslint-disable-next-line node/no-unsupported-features/node-builtins
//       const imageContent = await fs.promises.readFile(imagePath, 'base64');
//       imagesBase64.push(imageContent);
//     }),
//   );

//   res.status(200).json({
//     status: 'success',
//     imagesBase64,
//   });
// });
exports.getImageDataURI = catchAsyncErr(async (req, res, next) => {
  try {
    const imagesBase64 = await Promise.all(
      req.body.images.map(async (image) => {
        const imagePath = `public/pics/tasks/${image}`;
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        const imageContent = await fs.promises.readFile(imagePath, 'base64');
        return imageContent;
      }),
    );
    res.status(200).json({
      status: 'success',
      imagesBase64,
    });
  } catch (err) {
    console.error('File Read Error:', err);
    return next(new AppError('Error reading image data', 500));
  }
});
