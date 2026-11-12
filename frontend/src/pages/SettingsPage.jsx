
import { useEffect, useState } from 'react'
import { Settings, Users, ShieldCheck, Save } from 'lucide-react'
import { supabase } from '../supabase'
import './SettingsPage.css'

export default function SettingsPage({ workspace, role, onWorkspaceUpdate }) {
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const canRename = ['owner', 'admin'].includes(role)

  useEffect(() => {
    setWorkspaceName(workspace?.name || '')
    setMessage('')
    setError('')
  }, [workspace?.name])

  const handleSave = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const trimmedName = workspaceName.trim()

    if (!trimmedName) {
      setError('Workspace name cannot be empty.')
      return
    }

    if (trimmedName.length > 60) {
      setError('Workspace name cannot exceed 60 characters.')
      return
    }

    if (trimmedName === workspace?.name) {
      setMessage('No changes to save.')
      return
    }

    if (!workspace?.id) {
      setError('Workspace information is not available.')
      return
    }

    setSaving(true)

    try {
      const { data, error: updateError } = await supabase
        .from('workspaces')
        .update({ name: trimmedName })
        .eq('id', workspace.id)
        .select()
        .single()

      if (updateError) throw updateError

      onWorkspaceUpdate?.(data)
      setMessage('Workspace name updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update workspace.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE CONFIGURATION</div>
          <h1>Settings</h1>
          <p>Manage your workspace and account preferences.</p>
        </div>
      </div>

      <section className="settings-panel">
        <div className="settings-section-title">
          <div>
            <h2>Workspace information</h2>
            <p>Your current BrandGuard workspace</p>
          </div>
          <Settings size={20} className="settings-section-icon" />
        </div>

        <div className="settings-feature-list">
          <div className="settings-feature-item">
            <ShieldCheck size={16} />
            <span>
              Workspace: <strong>{workspace?.name || 'Loading...'}</strong>
            </span>
          </div>

          <div className="settings-feature-item">
            <Users size={16} />
            <span>
              Your role: <strong>{role || 'Member'}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="settings-workspace-form">
          <label htmlFor="workspace-name" className="settings-label">
            Workspace name
          </label>

          <input
            id="workspace-name"
            className="settings-input"
            type="text"
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            maxLength={60}
            disabled={!canRename || saving}
            placeholder="Enter workspace name"
          />

          <span className="settings-hint">
            Maximum 60 characters. This name identifies your BrandGuard workspace.
          </span>

          {canRename ? (
            <div className="settings-actions">
              <button
                type="submit"
                className="settings-save-button"
                disabled={saving || !workspaceName.trim()}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save workspace name'}
              </button>

              {workspaceName !== (workspace?.name || '') && (
                <button
                  type="button"
                  className="settings-cancel-button"
                  disabled={saving}
                  onClick={() => {
                    setWorkspaceName(workspace?.name || '')
                    setMessage('')
                    setError('')
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <p className="settings-hint">
              Only workspace owners and admins can rename this workspace.
            </p>
          )}

          {message && (
            <p className="settings-message success">{message}</p>
          )}

          {error && (
            <p className="settings-message error">{error}</p>
          )}
        </form>
      </section>
    </div>
  )
}
