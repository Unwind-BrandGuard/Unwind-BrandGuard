const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateUser } = require('../middleware/authMiddleware');
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

router.post('/', authenticateUser, analysisLimiter, analyzeContent);

module.exports = router;