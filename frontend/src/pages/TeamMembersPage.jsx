
import { useCallback, useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  RefreshCw,
  Trash2,
  Clock,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../supabase'
import './TeamMembersPage.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  reviewer: 'Reviewer',
  viewer: 'Viewer'
}

export default function TeamMembersPage({ workspace, role }) {
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [inviting, setInviting] = useState(false)
  const [pendingAction, setPendingAction] = useState('')

  const canManage = ['owner', 'admin'].includes(role)
  const isOwner = role === 'owner'

  const manageableRoles = isOwner
    ? ['admin', 'editor', 'reviewer', 'viewer']
    : ['editor', 'reviewer', 'viewer']

  const getAccessToken = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    const token = data.session?.access_token

    if (!token) {
      throw new Error('Your session has expired. Please sign in again.')
    }

    return token
  }, [])

  const apiRequest = useCallback(async (path, options = {}) => {
    const token = await getAccessToken()

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'The request could not be completed.')
    }

    return result
  }, [getAccessToken])

  const loadTeam = useCallback(async () => {
    if (!workspace?.id) return

    setLoading(true)
    setError('')

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser()

      if (userError) throw userError

      if (!userData.user?.id) {
        throw new Error('Unable to identify the signed-in user.')
      }

      setCurrentUserId(userData.user.id)

      const memberResult = await apiRequest(
        `/api/workspaces/${workspace.id}/members`
      )

      setMembers(memberResult.members || [])

      if (canManage) {
        const invitationResult = await apiRequest(
          `/api/invitations/${workspace.id}`
        )

        setInvitations(invitationResult.invitations || [])
      } else {
        setInvitations([])
      }
    } catch (err) {
      setError(err.message || 'Unable to load team information.')
    } finally {
      setLoading(false)
    }
  }, [workspace?.id, apiRequest, canManage])

  useEffect(() => {
    loadTeam()
  }, [loadTeam])

  
async function handleInvite(event) {
  event.preventDefault()

  if (!inviteEmail.trim() || !workspace?.id) return

  setInviting(true)
  setError('')
  setNotice('')

  const recipientEmail = inviteEmail.trim()

  try {
    const result = await apiRequest('/api/invitations', {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspace.id,
        email: recipientEmail,
        role: inviteRole
      })
    })

    setInviteEmail('')

    if (result.email_sent) {
      setNotice(`Invitation link sent to ${recipientEmail}.`)
    } else {
      setError(
        result.message ||
        `Invitation was created, but the email could not be sent to ${recipientEmail}.`
      )
    }

    await loadTeam()
  } catch (err) {
    setError(err.message || 'Unable to create invitation.')
  } finally {
    setInviting(false)
  }
}

  async function handleRoleChange(userId, newRole) {
    if (!window.confirm(`Change this member's role to ${ROLE_LABELS[newRole]}?`)) {
      return
    }

    setPendingAction(userId)
    setError('')
    setNotice('')

    try {
      await apiRequest(
        `/api/workspaces/${workspace.id}/members/${userId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ role: newRole })
        }
      )

      setNotice('Member role updated successfully.')
      await loadTeam()
    } catch (err) {
      setError(err.message || 'Unable to update member role.')
    } finally {
      setPendingAction('')
    }
  }

  async function handleRemove(member) {
    if (!window.confirm(`Remove ${member.email || 'this member'} from the workspace?`)) {
      return
    }

    setPendingAction(member.user_id)
    setError('')
    setNotice('')

    try {
      await apiRequest(
        `/api/workspaces/${workspace.id}/members/${member.user_id}`,
        { method: 'DELETE' }
      )

      setNotice('Member removed successfully.')
      await loadTeam()
    } catch (err) {
      setError(err.message || 'Unable to remove member.')
    } finally {
      setPendingAction('')
    }
  }

  async function handleRevoke(invitationId) {
    if (!window.confirm('Revoke this pending invitation?')) return

    setPendingAction(invitationId)
    setError('')
    setNotice('')

    try {
      await apiRequest(`/api/invitations/${invitationId}`, {
        method: 'DELETE'
      })

      setNotice('Invitation revoked successfully.')
      await loadTeam()
    } catch (err) {
      setError(err.message || 'Unable to revoke invitation.')
    } finally {
      setPendingAction('')
    }
  }

  if (loading) {
    return (
      <div className="team-loading">
        <RefreshCw className="spin" size={22} />
        <span>Loading workspace team...</span>
      </div>
    )
  }

  return (
    <div className="team-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE GOVERNANCE</div>
          <h1>Team Members</h1>
          <p>Manage workspace access, responsibilities and invitations.</p>
        </div>

        <button className="team-refresh" onClick={loadTeam}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="team-alert error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {notice && (
        <div className="team-alert success">
          <Shield size={17} />
          {notice}
        </div>
      )}

      <div className="team-stats">
        <div className="team-stat-card">
          <Users size={20} />
          <div>
            <strong>{members.length}</strong>
            <span>Active members</span>
          </div>
        </div>

        {canManage && (
          <div className="team-stat-card">
            <Mail size={20} />
            <div>
              <strong>
                {invitations.filter(item => item.status === 'pending').length}
              </strong>
              <span>Pending invitations</span>
            </div>
          </div>
        )}
      </div>

      {canManage && (
        <section className="team-panel">
          <div className="team-panel-heading">
            <div>
              <h2>Invite a team member</h2>
              <p>Grant workspace access through a secure invitation.</p>
            </div>
            <UserPlus size={21} />
          </div>

          <form className="invite-form" onSubmit={handleInvite}>
            <label>
              Email address
              <input
                type="email"
                value={inviteEmail}
                onChange={event => setInviteEmail(event.target.value)}
                placeholder="colleague@company.com"
                required
              />
            </label>

            <label>
              Workspace role
              <select
                value={inviteRole}
                onChange={event => setInviteRole(event.target.value)}
              >
                {manageableRoles.map(item => (
                  <option key={item} value={item}>
                    {ROLE_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" disabled={inviting}>
              <UserPlus size={16} />
              {inviting ? 'Creating...' : 'Create invitation'}
            </button>
          </form>
        </section>
      )}

      <section className="team-panel">
        <div className="team-panel-heading">
          <div>
            <h2>Workspace members</h2>
            <p>People who currently have access to this workspace.</p>
          </div>
          <Users size={21} />
        </div>

        <div className="team-table-wrap">
          <table className="team-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {members.map(member => {
                const isMemberOwner =
                  member.role === 'owner' ||
                  member.user_id === workspace?.owner_id

                const canManageMember =
                  canManage &&
                  member.user_id !== currentUserId &&
                  !isMemberOwner &&
                  (
                    isOwner ||
                    ['editor', 'reviewer', 'viewer'].includes(member.role)
                  )

                return (
                  <tr key={member.id}>
                    <td>
                      <div className="member-identity">
                        <div className="member-avatar">
                          {(member.email || '?').charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{member.email || 'Unknown user'}</strong>
                          <span>
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`role-pill ${member.role}`}>
                        {ROLE_LABELS[member.role] || member.role}
                      </span>
                    </td>

                    {canManage && (
                      <td>
                        {canManageMember ? (
                          <div className="member-actions">
                            <select
                              value={member.role}
                              disabled={pendingAction === member.user_id}
                              onChange={event =>
                                handleRoleChange(member.user_id, event.target.value)
                              }
                              aria-label={`Change role for ${member.email}`}
                            >
                              {manageableRoles.map(item => (
                                <option key={item} value={item}>
                                  {ROLE_LABELS[item]}
                                </option>
                              ))}
                            </select>

                            <button
                              className="remove-member"
                              title="Remove member"
                              disabled={pendingAction === member.user_id}
                              onClick={() => handleRemove(member)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="protected-member">Protected</span>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}

              {members.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 3 : 2} className="empty-team">
                    No workspace members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {canManage && (
        <section className="team-panel">
          <div className="team-panel-heading">
            <div>
              <h2>Pending invitations</h2>
              <p>Invitations awaiting acceptance.</p>
            </div>
            <Clock size={21} />
          </div>

          {invitations.filter(item => item.status === 'pending').length === 0 ? (
            <div className="empty-invitations">
              No pending invitations.
            </div>
          ) : (
            <div className="invitation-list">
              {invitations
                .filter(item => item.status === 'pending')
                .map(invitation => (
                  <div className="invitation-item" key={invitation.id}>
                    <div>
                      <strong>{invitation.email}</strong>
                      <span>
                        {ROLE_LABELS[invitation.role]} · Expires{' '}
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      className="revoke-invitation"
                      disabled={pendingAction === invitation.id}
                      onClick={() => handleRevoke(invitation.id)}
                    >
                      {pendingAction === invitation.id ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
