const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

const { authenticateUser } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { analyzeContent } = require('../controllers/analysisController');

const router = express.Router();

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many analysis requests. Please try again in a minute.',
  },
});

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size must not exceed 10 MB.',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Unable to upload the selected file.',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid file upload.',
    });
  });
}

router.post(
  '/',
  authenticateUser,
  analysisLimiter,
  handleUpload,
  analyzeContent
);

module.exports = router;