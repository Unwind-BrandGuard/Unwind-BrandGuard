const { randomUUID } = require('crypto');
const { analyzeWithGemini } = require('../services/geminiService');

const BUCKET_NAME = 'review-assets';

const allowedMimeTypes = {
  'image/png': {
    extension: 'png',
    signature: (buffer) =>
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      ),
  },
  'image/jpeg': {
    extension: 'jpg',
    signature: (buffer) =>
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  'image/webp': {
    extension: 'webp',
    signature: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP',
  },
  'application/pdf': {
    extension: 'pdf',
    signature: (buffer) =>
      buffer.length >= 5 &&
      buffer.toString('ascii', 0, 5) === '%PDF-',
  },
};

async function analyzeContent(req, res) {
  let uploadedAssetPath = null;

  try {
    const { content = '', workspace_id } = req.body;
    const file = req.file || null;

    const submittedContent =
      typeof content === 'string' ? content.trim() : '';

    // Require text, an asset, or both.
    if (!submittedContent && !file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text content or upload an image/PDF.',
      });
    }

    if (
      typeof content !== 'string' ||
      content.length > 20000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Content must be 20,000 characters or fewer.',
      });
    }

    if (!workspace_id || typeof workspace_id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Workspace ID is required.',
      });
    }

    // Verify the actual uploaded file signature.
    if (file) {
      const fileType = allowedMimeTypes[file.mimetype];

      if (
        !fileType ||
        !file.buffer ||
        !fileType.signature(file.buffer)
      ) {
        return res.status(400).json({
          success: false,
          message: 'The uploaded file is invalid or its format does not match its content.',
        });
      }
    }

    // Verify workspace membership.
    const { data: membership, error: membershipError } =
      await req.supabase
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

    // Fetch active workspace guidelines.
    const { data: guidelines, error: guidelineError } =
      await req.supabase
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

    // Run Gemini analysis before storing the original asset.
    const result = await analyzeWithGemini(
      submittedContent,
      guidelines,
      file
    );

    let asset = null;

    // Upload the original asset to private Supabase Storage.
    if (file) {
      const fileType = allowedMimeTypes[file.mimetype];
      const filename = `${randomUUID()}.${fileType.extension}`;

      uploadedAssetPath = `${workspace_id}/${filename}`;

      const { error: uploadError } = await req.supabase.storage
        .from(BUCKET_NAME)
        .upload(uploadedAssetPath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      asset = {
        path: uploadedAssetPath,
        name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
      };
    }

    return res.status(200).json({
      success: true,
      analysis: result,
      asset,
    });
  } catch (error) {
    console.error('Brand analysis error:', error.message);

    // Remove an uploaded asset if a later operation failed.
    if (uploadedAssetPath) {
      const { error: cleanupError } = await req.supabase.storage
        .from(BUCKET_NAME)
        .remove([uploadedAssetPath]);

      if (cleanupError) {
        console.error(
          'Asset cleanup failed:',
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to analyse content right now. Please try again.',
    });
  }
}

module.exports = { analyzeContent };