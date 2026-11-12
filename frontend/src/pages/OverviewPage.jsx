
import {
  ShieldCheck,
  BookOpen,
  FileSearch,
  CheckCircle2,
  Activity,
  ArrowRight,
  LockKeyhole
} from 'lucide-react'

function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={18} />
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}

export default function OverviewPage({ workspace, setActive }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">BRAND GOVERNANCE</div>
          <h1>Protect what makes your brand yours.</h1>
          <p>
            Review content against your approved brand standards before publication.
          </p>
        </div>

        <div className="date-label">
          <Activity size={15} /> Workspace active
        </div>
      </div>

      <section className="welcome-panel">
        <div>
          <div className="eyebrow">YOUR WORKSPACE</div>
          <h2>Welcome to {workspace.name}.</h2>
          <p>
            Start by defining your brand standards. They'll become the
            foundation for every content review.
          </p>

          <button
            className="primary-button"
            onClick={() => setActive('Brand Guidelines')}
          >
            Set up brand guidelines <ArrowRight size={17} />
          </button>
        </div>

        <div className="welcome-icon">
          <ShieldCheck size={65} />
        </div>
      </section>

      <section className="stats-grid">
        <Stat
          icon={BookOpen}
          label="Brand guidelines"
          value="—"
          note="Standards configured"
        />

        <Stat
          icon={FileSearch}
          label="Content reviews"
          value="0"
          note="Reviews submitted"
        />

        <Stat
          icon={CheckCircle2}
          label="Approved content"
          value="0"
          note="Human-approved items"
        />

        <Stat
          icon={Activity}
          label="Governance status"
          value="Setup"
          note="Ready for configuration"
        />
      </section>

      <section className="bottom-grid">
        <div className="content-panel">
          <div className="section-title">
            <div>
              <h2>Getting started</h2>
              <p>Build your brand governance workflow</p>
            </div>
          </div>

          <div className="getting-started">
            <div>
              <span>01</span>
              <div>
                <strong>Define your brand</strong>
                <p>Add voice, terminology, facts and content rules.</p>
              </div>
              <button onClick={() => setActive('Brand Guidelines')}>
                <ArrowRight size={17} />
              </button>
            </div>

            <div>
              <span>02</span>
              <div>
                <strong>Submit content</strong>
                <p>Send copy for a guideline-based review.</p>
              </div>
              <button onClick={() => setActive('Content Reviews')}>
                <ArrowRight size={17} />
              </button>
            </div>

            <div>
              <span>03</span>
              <div>
                <strong>Review and approve</strong>
                <p>Inspect findings and decide what gets approved.</p>
              </div>
              <button onClick={() => setActive('Content Reviews')}>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>

        <div className="content-panel insight-panel">
          <div className="eyebrow">OUR PRINCIPLE</div>

          <div className="insight-icon">
            <LockKeyhole size={21} />
          </div>

          <h2>AI assists. Humans decide.</h2>

          <p>
            BrandGuard helps identify inconsistencies and suggest corrections.
            Final content approval always remains with an authorised human reviewer.
          </p>

          <div className="insight-tag">
            <ShieldCheck size={14} /> Human-controlled governance
          </div>
        </div>
      </section>
    </>
  )
}
