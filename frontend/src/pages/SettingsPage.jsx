
import { Settings, Users, ShieldCheck } from 'lucide-react'

export default function SettingsPage({ workspace, role }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE CONFIGURATION</div>
          <h1>Settings</h1>
          <p>Manage your workspace and account preferences.</p>
        </div>
      </div>

      <section className="content-panel">
        <div className="section-title">
          <div>
            <h2>Workspace information</h2>
            <p>Your current BrandGuard workspace</p>
          </div>
          <Settings size={20} />
        </div>

        <div className="feature-list">
          <div><ShieldCheck size={16} /> Workspace: {workspace?.name || 'Loading...'}</div>
          <div><Users size={16} /> Your role: {role || 'Member'}</div>
        </div>
      </section>
    </>
  )
}
