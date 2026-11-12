
const { supabaseAdmin } = require('../config/supabaseAdmin');

const ALLOWED_ROLES = ['admin', 'editor', 'reviewer', 'viewer'];
const ADMIN_MANAGED_ROLES = ['editor', 'reviewer', 'viewer'];

async function getActorMembership(req, workspaceId) {
  const { data, error } = await req.supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function getWorkspaceOwner(workspaceId) {
  const { data, error } = await supabaseAdmin
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .maybeSingle();

  if (error) throw error;

  return data?.owner_id || null;
}

async function getTargetMember(req, workspaceId, userId) {
  const { data, error } = await req.supabase
    .from('workspace_members')
    .select('id, workspace_id, user_id, role, joined_at')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function listWorkspaceMembers(req, res) {
  try {
    const { workspace_id } = req.params;

    const actor = await getActorMembership(req, workspace_id);

    if (!actor) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this workspace.',
      });
    }

    const { data: members, error } = await req.supabase
      .from('workspace_members')
      .select('id, workspace_id, user_id, role, joined_at')
      .eq('workspace_id', workspace_id)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    const membersWithEmails = await Promise.all(
      members.map(async member => {
        const { data, error: userError } =
          await supabaseAdmin.auth.admin.getUserById(member.user_id);

        if (userError) throw userError;

        return {
          ...member,
          email: data.user?.email || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      members: membersWithEmails,
    });
  } catch (error) {
    console.error('List workspace members error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to load workspace members.',
    });
  }
}

async function updateMemberRole(req, res) {
  try {
    const { workspace_id, user_id } = req.params;
    const { role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid workspace role.',
      });
    }

    const actor = await getActorMembership(req, workspace_id);

    if (!actor || !['owner', 'admin'].includes(actor.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage workspace members.',
      });
    }

    if (user_id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own workspace role.',
      });
    }

    const target = await getTargetMember(req, workspace_id, user_id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Workspace member not found.',
      });
    }

    const ownerId = await getWorkspaceOwner(workspace_id);

    if (target.user_id === ownerId || target.role === 'owner') {
      return res.status(403).json({
        success: false,
        message: 'The workspace owner cannot be modified.',
      });
    }

    if (
      actor.role === 'admin' &&
      (
        !ADMIN_MANAGED_ROLES.includes(target.role) ||
        !ADMIN_MANAGED_ROLES.includes(role)
      )
    ) {
      return res.status(403).json({
        success: false,
        message: 'Admins can only manage editors, reviewers and viewers.',
      });
    }

    const { data, error } = await req.supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', workspace_id)
      .eq('user_id', user_id)
      .select('id, workspace_id, user_id, role, joined_at')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      member: data,
    });
  } catch (error) {
    console.error('Update member role error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to update member role.',
    });
  }
}

async function removeWorkspaceMember(req, res) {
  try {
    const { workspace_id, user_id } = req.params;

    const actor = await getActorMembership(req, workspace_id);

    if (!actor || !['owner', 'admin'].includes(actor.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove workspace members.',
      });
    }

    if (user_id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot remove yourself from this workspace.',
      });
    }

    const target = await getTargetMember(req, workspace_id, user_id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Workspace member not found.',
      });
    }

    const ownerId = await getWorkspaceOwner(workspace_id);

    if (target.user_id === ownerId || target.role === 'owner') {
      return res.status(403).json({
        success: false,
        message: 'The workspace owner cannot be removed.',
      });
    }

    if (
      actor.role === 'admin' &&
      !ADMIN_MANAGED_ROLES.includes(target.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot remove other administrators.',
      });
    }

    const { error } = await req.supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspace_id)
      .eq('user_id', user_id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Member removed from workspace successfully.',
    });
  } catch (error) {
    console.error('Remove workspace member error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to remove workspace member.',
    });
  }
}

module.exports = {
  listWorkspaceMembers,
  updateMemberRole,
  removeWorkspaceMember,
};