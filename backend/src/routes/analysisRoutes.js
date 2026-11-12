const express = require('express');
const { analyzeContent } = require('../controllers/analysisController');

const router = express.Router();

router.post('/', analyzeContent);

module.exports = router;