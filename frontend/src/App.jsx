import { useEffect, useState } from 'react'
import {
  ShieldCheck, LayoutDashboard, BookOpen, FileSearch,
  ChartNoAxesCombined, Settings, LogOut, Menu, X,
  LockKeyhole, Mail, ArrowRight, Activity, Plus,
  Clock3, CheckCircle2, AlertTriangle
} from 'lucide-react'
import { supabase } from './supabase'
import './App.css'

const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Brand Guidelines', icon: BookOpen },
  { name: 'Content Reviews', icon: FileSearch },
  { name: 'Insights', icon: ChartNoAxesCombined },
  { name: 'Settings', icon: Settings },
]

function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (!data.session) {
          setMessage('Account created. Please check your email to confirm your account before signing in.')
        } else {
          setMessage('Your account has been created successfully.')
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon"><ShieldCheck size={25} /></div>
          <div>
            <strong>UNWIND</strong>
            <span>BRANDGUARD</span>
          </div>
        </div>

        <div className="eyebrow">BRAND GOVERNANCE PLATFORM</div>
        <h1>{mode === 'login' ? 'Welcome back.' : 'Create your workspace.'}</h1>
        <p className="auth-description">
          {mode === 'login'
            ? 'Sign in to manage your brand standards and content reviews.'
            : 'Get started with a workspace built around your brand standards.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email address</label>
          <div className="auth-input">
            <Mail size={17} />
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="auth-input">
            <LockKeyhole size={17} />
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}

          <button className="primary-button auth-submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login' ? 'Sign in' : 'Create account'}
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError('')
            setMessage('')
          }}>
            {mode === 'login' ? 'Create account' : 'Sign in'}
          </button>
        </div>

        <div className="auth-security">
          <LockKeyhole size={14} />
          Secured with Supabase Authentication
        </div>
      </div>
    </main>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return

      if (error) console.error('Session check failed:', error)
      setSession(data?.session ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out failed:', error.message)
  }

  if (authLoading) {
    return (
      <div className="loading-screen">
        <ShieldCheck size={30} />
        <span>Preparing your workspace...</span>
      </div>
    )
  }

  if (!session) return <AuthScreen />

  const email = session.user.email || 'Workspace member'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={23} /></div>
          <div><strong>UNWIND</strong><span>BRANDGUARD</span></div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)}>
            <X />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav>
          {navigation.map(item => (
            <button
              key={item.name}
              className={`nav-item ${active === item.name ? 'selected' : ''}`}
              onClick={() => {
                setActive(item.name)
                setMenuOpen(false)
              }}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="protection-card">
            <ShieldCheck size={20} />
            <strong>Governance workspace</strong>
            <span>Human-controlled content review.</span>
          </div>

          <div className="profile">
            <div className="avatar">{email.charAt(0).toUpperCase()}</div>
            <div className="profile-details">
              <strong>Workspace member</strong>
              <span>{email}</span>
            </div>
            <button className="logout-button" onClick={handleLogout} title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <div className="breadcrumb">BrandGuard <span>/</span> {active}</div>
          <div className="top-status">
            <span className="status-dot" /> Authenticated workspace
          </div>
        </header>

        <div className="page">
          {active === 'Overview' && <Overview email={email} setActive={setActive} />}

          {active === 'Brand Guidelines' && (
            <Placeholder
              eyebrow="BRAND KNOWLEDGE"
              title="Brand Guidelines"
              description="Define the standards that every piece of brand content should follow."
              icon={BookOpen}
              items={['Brand voice and tone', 'Approved terminology', 'Verified facts and claims', 'Prohibited phrases']}
              action="Create your first guideline"
            />
          )}

          {active === 'Content Reviews' && (
            <Placeholder
              eyebrow="CONTENT GOVERNANCE"
              title="Content Reviews"
              description="Submit content for review before it reaches your audience."
              icon={FileSearch}
              items={['Marketing copy', 'Social media posts', 'Email campaigns', 'Website content']}
              action="Start a content review"
            />
          )}

          {active === 'Insights' && (
            <Placeholder
              eyebrow="GOVERNANCE INTELLIGENCE"
              title="Insights"
              description="Understand recurring brand inconsistencies and review outcomes."
              icon={ChartNoAxesCombined}
              items={['Common brand violations', 'Review trends', 'Approval activity', 'Content consistency']}
            />
          )}

          {active === 'Settings' && (
            <Placeholder
              eyebrow="WORKSPACE CONFIGURATION"
              title="Settings"
              description="Manage your workspace and account preferences."
              icon={Settings}
              items={['Account information', 'Workspace preferences', 'Access and permissions']}
            />
          )}
        </div>

        <footer>
          UNWIND BRANDGUARD <span>·</span> Prototype v0.2
          <span>·</span> AI-assisted, human-controlled governance
        </footer>
      </main>
    </div>
  )
}

function Overview({ email, setActive }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">BRAND GOVERNANCE</div>
          <h1>Protect what makes your brand yours.</h1>
          <p>Review content against your approved brand standards before publication.</p>
        </div>
        <div className="date-label"><Activity size={15} /> Workspace active</div>
      </div>

      <section className="welcome-panel">
        <div>
          <div className="eyebrow">YOUR WORKSPACE</div>
          <h2>Welcome to BrandGuard.</h2>
          <p>Start by defining your brand standards. They'll become the foundation for every content review.</p>
          <button className="primary-button" onClick={() => setActive('Brand Guidelines')}>
            Set up brand guidelines <ArrowRight size={17} />
          </button>
        </div>
        <div className="welcome-icon"><ShieldCheck size={65} /></div>
      </section>

      <section className="stats-grid">
        <Stat icon={BookOpen} label="Brand guidelines" value="0" note="Standards configured" />
        <Stat icon={FileSearch} label="Content reviews" value="0" note="Reviews submitted" />
        <Stat icon={CheckCircle2} label="Approved content" value="0" note="Human-approved items" />
        <Stat icon={Activity} label="Governance status" value="Setup" note="Ready for configuration" />
      </section>

      <section className="bottom-grid">
        <div className="content-panel">
          <div className="section-title">
            <div><h2>Getting started</h2><p>Build your brand governance workflow</p></div>
          </div>
          <div className="getting-started">
            <div><span>01</span><div><strong>Define your brand</strong><p>Add voice, terminology, facts and content rules.</p></div><button onClick={() => setActive('Brand Guidelines')}><ArrowRight size={17}/></button></div>
            <div><span>02</span><div><strong>Submit content</strong><p>Send copy for a guideline-based review.</p></div><button onClick={() => setActive('Content Reviews')}><ArrowRight size={17}/></button></div>
            <div><span>03</span><div><strong>Review and approve</strong><p>Inspect findings and decide what gets approved.</p></div><button onClick={() => setActive('Content Reviews')}><ArrowRight size={17}/></button></div>
          </div>
        </div>

        <div className="content-panel insight-panel">
          <div className="eyebrow">OUR PRINCIPLE</div>
          <div className="insight-icon"><LockKeyhole size={21}/></div>
          <h2>AI assists. Humans decide.</h2>
          <p>BrandGuard helps identify inconsistencies and suggest corrections. Final content approval always remains with an authorised human reviewer.</p>
          <div className="insight-tag"><ShieldCheck size={14}/> Human-controlled governance</div>
        </div>
      </section>
    </>
  )
}

function Placeholder({ eyebrow, title, description, icon: Icon, items, action }) {
  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      </div>
      <section className="content-panel placeholder-panel">
        <div className="placeholder-icon"><Icon size={28}/></div>
        <h2>{action || 'Coming in the next milestone'}</h2>
        <p>This section is part of the BrandGuard governance workflow. We'll connect its functionality in the upcoming milestones.</p>
        <div className="feature-list">
          {items.map((item, index) => (
            <div key={item}><CheckCircle2 size={16}/>{item}</div>
          ))}
        </div>
        <span className="coming-soon"><Clock3 size={14}/> Implementation in progress</span>
      </section>
    </>
  )
}

function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span>{label}</span><Icon size={18}/></div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}

export default App