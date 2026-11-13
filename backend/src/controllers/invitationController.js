const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabaseAdmin');
const { sendInvitationEmail } = require('../services/emailService');

const ALLOWED_ROLES = ['admin', 'editor', 'reviewer', 'viewer'];

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function getWorkspaceMembership(req, workspaceId) {
  const { data, error } = await req.supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function createInvitation(req, res) {
  try {
    const { workspace_id, email, role } = req.body;

    if (!workspace_id || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Workspace, email and role are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace role.',
      });
    }

    const membership = await getWorkspaceMembership(req, workspace_id);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only workspace owners and admins can invite members.',
      });
    }

    if (role === 'admin' && membership.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only workspace owners can invite administrators.',
      });
    }

    if (
      req.user.email &&
      normalizedEmail === req.user.email.toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message: 'You cannot invite yourself.',
      });
    }

    const { data: workspace, error: workspaceError } = await req.supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspace_id)
      .single();

    if (workspaceError || !workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    const { data: existingInvitation, error: existingError } =
      await supabaseAdmin
        .from('workspace_invitations')
        .select('id')
        .eq('workspace_id', workspace_id)
        .eq('email', normalizedEmail)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

    if (existingError) throw existingError;

    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        message: 'A pending invitation already exists for this email.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: invitation, error: invitationError } =
      await supabaseAdmin
        .from('workspace_invitations')
        .insert({
          workspace_id,
          email: normalizedEmail,
          role,
          token_hash: tokenHash,
          invited_by: req.user.id,
          expires_at: expiresAt,
        })
        .select('id, email, role, status, expires_at, created_at')
        .single();

    if (invitationError) throw invitationError;

    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ).replace(/\/+$/, '');

    const invitationLink =
  `${frontendUrl}/accept-invitation?token=${token}`;

let emailSent = false;

try {
  const { data: workspaceDetails, error: detailsError } =
    await req.supabase
      .from('workspaces')
      .select('name')
      .eq('id', workspace_id)
      .single();

  if (detailsError) throw detailsError;

  await sendInvitationEmail({
    email: normalizedEmail,
    role,
    invitationLink,
    workspaceName: workspaceDetails.name
  });

  emailSent = true;
} catch (emailError) {
  console.error('Invitation email delivery failed:', emailError.message);
}

return res.status(201).json({
  success: true,
  message: emailSent
    ? 'Invitation created and email sent successfully.'
    : 'Invitation created, but email delivery failed. You can share the invitation link manually.',
  email_sent: emailSent,
  invitation,
  invitation_link: invitationLink,
});

  } catch (error) {
    console.error('Create invitation error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to create invitation.',
    });
  }
}

async function listInvitations(req, res) {
  try {
    const { workspace_id } = req.params;

    if (!workspace_id) {
      return res.status(400).json({
        success: false,
        message: 'Workspace ID is required.',
      });
    }

    const membership = await getWorkspaceMembership(req, workspace_id);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view invitations.',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('workspace_invitations')
      .select(
        'id, workspace_id, email, role, status, invited_by, accepted_by, expires_at, accepted_at, revoked_at, created_at'
      )
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      invitations: data,
    });
  } catch (error) {
    console.error('List invitations error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to load invitations.',
    });
  }
}

async function revokeInvitation(req, res) {
  try {
    const { invitation_id } = req.params;

    if (!invitation_id) {
      return res.status(400).json({
        success: false,
        message: 'Invitation ID is required.',
      });
    }

    const { data: invitation, error: invitationError } =
      await supabaseAdmin
        .from('workspace_invitations')
        .select('id, workspace_id, status')
        .eq('id', invitation_id)
        .maybeSingle();

    if (invitationError) throw invitationError;

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.',
      });
    }

    const membership = await getWorkspaceMembership(
      req,
      invitation.workspace_id
    );

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to revoke this invitation.',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: 'Only pending invitations can be revoked.',
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from('workspace_invitations')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
      })
      .eq('id', invitation_id)
      .eq('status', 'pending');

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: 'Invitation revoked successfully.',
    });
  } catch (error) {
    console.error('Revoke invitation error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to revoke invitation.',
    });
  }
}

async function acceptInvitation(req, res) {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        success: false,
        message: 'A valid invitation token is required.',
      });
    }

    if (!req.user.email) {
      return res.status(400).json({
        success: false,
        message: 'Your account must have an email address.',
      });
    }

    const { data, error } = await supabaseAdmin.rpc(
      'accept_workspace_invitation',
      {
        p_token_hash: hashToken(token),
        p_user_id: req.user.id,
        p_email: req.user.email,
      }
    );

    if (error) {
      if (
        error.message.includes('invalid, expired, or already used') ||
        error.message.includes('belongs to another email address') ||
        error.message.includes('already belongs to a workspace')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      throw error;
    }

    const membership = Array.isArray(data) ? data[0] : data;

    if (!membership?.workspace_id) {
      throw new Error(
        'Invitation was processed but the RPC did not return a workspace ID.'
      );
    }

    return res.status(200).json({
      success: true,
      message: 'You have successfully joined the workspace.',
      workspace_id: membership.workspace_id,
      role: membership.role,
      membership,
    });
  } catch (error) {
    console.error('Accept invitation error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to accept invitation.',
    });
  }
}

module.exports = {
  createInvitation,
  listInvitations,
  revokeInvitation,
  acceptInvitation,
};
