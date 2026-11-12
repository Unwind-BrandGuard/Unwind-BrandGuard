const { analyzeWithGemini } = require('../services/geminiService');

async function analyzeContent(req, res) {
  try {
    const { content, workspace_id } = req.body;

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

    if (!workspace_id) {
      return res.status(400).json({
        success: false,
        message: 'Workspace ID is required.',
      });
    }

    const { data: membership, error: membershipError } = await req.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this workspace.',
      });
    }

    if (!['owner', 'admin', 'editor'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to submit content for analysis.',
      });
    }

    const { data: guidelines, error: guidelineError } = await req.supabase
      .from('brand_guidelines')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('status', 'active');

    if (guidelineError) throw guidelineError;

    if (!guidelines || guidelines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active brand guidelines found for this workspace.',
      });
    }

    const result = await analyzeWithGemini(content.trim(), guidelines);

    return res.status(200).json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error('Brand analysis error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to analyse content right now. Please try again.',
    });
  }
}

module.exports = { analyzeContent };