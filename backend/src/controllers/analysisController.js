
const { analyzeWithGemini } = require('../services/geminiService');

async function analyzeContent(req, res) {
  try {
    const { content, guidelines } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required.',
      });
    }

    if (content.length > 20000) {
      return res.status(400).json({
        success: false,
        message: 'Content must be 20,000 characters or fewer.',
      });
    }

    if (!Array.isArray(guidelines) || guidelines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one active brand guideline is required.',
      });
    }

    const result = await analyzeWithGemini(content, guidelines);

    return res.status(200).json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('Brand analysis error:', error.message);

    return res.status(500).json({
      success: false,
      message: error.message.includes('API key')
        ? 'AI analysis is not configured. Check the backend API key.'
        : 'Unable to analyse content right now. Please try again.',
    });
  }
}

module.exports = { analyzeContent };