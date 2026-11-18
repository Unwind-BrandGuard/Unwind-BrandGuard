const multer = require('multer');

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new Error('Only PNG, JPG, JPEG, WEBP and PDF files are supported.')
      );
    }

    callback(null, true);
  },
});

module.exports = { upload };
