
import { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck, LayoutDashboard, BookOpen, FileSearch,
  ChartNoAxesCombined, Settings, LogOut, Menu, X,
  LockKeyhole, Mail, ArrowRight, Activity, Plus,
  Clock3, CheckCircle2, AlertTriangle, Pencil,
  Archive, RotateCcw, Search, Save, ChevronDown,
  Sparkles, FileCheck2, Users, Eye, Check, ArrowUpRight
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

const categories = [
  { value: 'voice_tone', label: 'Voice and tone' },
  { value: 'terminology', label: 'Approved terminology' },
  { value: 'approved_fact', label: 'Approved facts' },
  { value: 'prohibited_claim', label: 'Prohibited claims' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'visual_identity', label: 'Visual identity' },
  { value: 'other', label: 'Other' },
]

function LandingPage({ onGetStarted, onSignIn }) {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <a className="landing-brand" href="#home">
          <span className="brand-icon"><ShieldCheck size={23} /></span>
          <span><strong>UNWIND</strong><small>BRANDGUARD</small></span>
        </a>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#principles">Our approach</a>
        </div>

        <div className="landing-nav-actions">
          <button className="landing-signin" onClick={onSignIn}>Sign in</button>
          <button className="primary-button" onClick={onGetStarted}>
            Get started <ArrowUpRight size={16} />
          </button>
        </div>
      </nav>

      <section className="landing-hero" id="home">
        <div className="landing-hero-copy">
          <div className="eyebrow"><span className="status-dot" /> BRAND GOVERNANCE, REIMAGINED</div>
          <h1>Your brand.<br /><span>Your standards.</span><br />Protected.</h1>
          <p>
            Keep every message consistent with the brand you've built.
            Review content against your approved guidelines before it reaches your audience.
          </p>

          <div className="landing-hero-actions">
            <button className="primary-button" onClick={onGetStarted}>
              Create your workspace <ArrowRight size={17} />
            </button>
            <a href="#how-it-works" className="text-link">See how it works <ArrowRight size={15} /></a>
          </div>

          <div className="landing-trust-line">
            <LockKeyhole size={15} />
            Human-controlled reviews. Your standards stay yours.
          </div>
        </div>

        <div className="landing-visual">
          <div className="visual-glow" />
          <div className="review-window">
            <div className="review-window-top">
              <div className="window-dots"><i /><i /><i /></div>
              <span>CONTENT REVIEW</span>
              <span className="review-window-status">ANALYSIS</span>
            </div>

            <div className="review-document">
              <div className="document-label">CAMPAIGN COPY · DRAFT 04</div>
              <h3>Make space for a healthier tomorrow.</h3>
              <p>
                Our platform helps people build healthier habits through
                thoughtful reflection and consistent support.
              </p>
              <div className="document-highlight">
                <span>REVIEW SUGGESTION</span>
                Consider using your approved phrase: “supportive wellbeing journey”.
              </div>
            </div>

            <div className="review-findings">
              <div className="finding-heading">
                <span><Sparkles size={15} /> REVIEW FINDINGS</span>
                <small>02 ITEMS</small>
              </div>
              <div className="finding-row">
                <span className="finding-dot warning" />
                <div><strong>Terminology consistency</strong><small>Approved terminology reference</small></div>
                <span className="finding-tag">REVIEW</span>
              </div>
              <div className="finding-row">
                <span className="finding-dot good" />
                <div><strong>Voice and tone</strong><small>Supportive tone guideline</small></div>
                <span className="finding-tag clear">CLEAR</span>
              </div>
            </div>

            <div className="review-window-footer">
              <span><LockKeyhole size={13} /> Human approval required</span>
              <span>BRANDGUARD <ShieldCheck size={14} /></span>
            </div>
          </div>

          <div className="floating-note">
            <CheckCircle2 size={17} />
            <span><strong>Purpose preserved</strong><small>Creator intent matters</small></span>
          </div>
        </div>
      </section>

      <section className="landing-principles" id="principles">
        <div>
          <span className="eyebrow">BUILT FOR CONSISTENCY</span>
          <h2>One brand. Every touchpoint.</h2>
        </div>
        <p>
          BrandGuard helps teams turn brand documentation into practical
          guidance for everyday content decisions.
        </p>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-heading">
          <span className="eyebrow">WHAT BRANDGUARD DOES</span>
          <h2>Clarity before content goes live.</h2>
          <p>Bring your standards, content and review decisions into one workflow.</p>
        </div>

        <div className="landing-feature-grid">
          <FeatureCard
            icon={BookOpen}
            number="01"
            title="Define your standards"
            description="Bring together your voice, tone, approved terminology, facts and content rules."
          />
          <FeatureCard
            icon={Sparkles}
            number="02"
            title="Review with context"
            description="Identify inconsistencies, unsupported claims and terminology that needs attention."
          />
          <FeatureCard
            icon={FileCheck2}
            number="03"
            title="Improve with evidence"
            description="Understand why something needs attention and see the relevant brand reference."
          />
          <FeatureCard
            icon={Users}
            number="04"
            title="Keep humans in control"
            description="Let authorised people review suggestions and make the final approval decision."
          />
        </div>
      </section>

      <section className="landing-workflow" id="how-it-works">
        <div className="landing-section-heading">
          <span className="eyebrow">A CLEARER WORKFLOW</span>
          <h2>From brand rules to confident publishing.</h2>
        </div>

        <div className="workflow-steps">
          <WorkflowStep number="01" title="Define" description="Add your approved brand guidelines and facts." />
          <WorkflowStep number="02" title="Submit" description="Bring in the content you want to review." />
          <WorkflowStep number="03" title="Improve" description="Understand findings and consider suggested changes." />
          <WorkflowStep number="04" title="Approve" description="A human reviewer makes the final decision." />
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-icon"><ShieldCheck size={30} /></div>
        <span className="eyebrow">YOUR BRAND, YOUR CONTROL</span>
        <h2>Make every piece of content feel like you.</h2>
        <p>Start building a more consistent and accountable content workflow.</p>
        <button className="primary-button" onClick={onGetStarted}>
          Get started with BrandGuard <ArrowRight size={17} />
        </button>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand" href="#home">
          <span className="brand-icon"><ShieldCheck size={20} /></span>
          <span><strong>UNWIND</strong><small>BRANDGUARD</small></span>
        </a>
        <span>AI-assisted. Human-controlled.</span>
        <span>UNWIND BRANDGUARD · PROTOTYPE</span>
      </footer>
    </main>
  )
}

function FeatureCard({ icon: Icon, number, title, description }) {
  return (
    <article className="landing-feature-card">
      <div className="feature-card-top">
        <span className="feature-card-icon"><Icon size={21} /></span>
        <span>{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

function WorkflowStep({ number, title, description }) {
  return (
    <article className="workflow-step">
      <span>{number}</span>
      <div className="workflow-step-line" />
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

function AuthScreen({ onBack }) {
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
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        setMessage(
          data.session
            ? 'Your account has been created successfully.'
            : 'Account created. Please check your email to confirm your account before signing in.'
        )
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-screen">
      <button className="auth-back-button" onClick={onBack}>
        <ArrowRight size={15} /> Back to BrandGuard
      </button>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon"><ShieldCheck size={25} /></div>
          <div><strong>UNWIND</strong><span>BRANDGUARD</span></div>
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
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
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
  const [authOpen, setAuthOpen] = useState(false)
  const [workspace, setWorkspace] = useState(null)
  const [role, setRole] = useState(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [workspaceRetry, setWorkspaceRetry] = useState(0)
  const [workspaceError, setWorkspaceError] = useState('')
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const workspaceRequests = useRef(new Map())

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) console.error('Session check failed:', error)
      setSession(data?.session ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) setAuthOpen(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const user = session?.user

    if (!user) {
      setWorkspace(null)
      setRole(null)
      setWorkspaceError('')
      setWorkspaceLoading(false)
      return
    }

    let cancelled = false

    setWorkspaceLoading(true)
    setWorkspaceError('')

    let request = workspaceRequests.current.get(user.id)

    if (!request) {
      request = (async () => {
        const { data: authData, error: authError } =
          await supabase.auth.getUser()

        if (authError) throw authError

        const authenticatedUserId = authData.user?.id

        if (!authenticatedUserId || authenticatedUserId !== user.id) {
          throw new Error('Your session could not be verified. Please sign in again.')
        }

        const { data: memberships, error: membershipError } = await supabase
          .from('workspace_members')
          .select('workspace_id, role')
          .eq('user_id', user.id)

        if (membershipError) throw membershipError

        let membership = memberships?.[0]
        let currentWorkspace

        if (membership) {
          const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('id', membership.workspace_id)
            .single()

          if (error) throw error
          currentWorkspace = data
        } else {
          const workspaceName =
            `${user.email?.split('@')[0] || 'My'} Brand Workspace`

          const { data, error } = await supabase.rpc(
            'create_my_workspace',
            { workspace_name: workspaceName }
          ).single()

          if (error) throw error

          currentWorkspace = data
          membership = {
            role: 'owner',
            workspace_id: data.id
          }
        }

        return {
          workspace: currentWorkspace,
          role: membership?.role || null
        }
      })()

      workspaceRequests.current.set(user.id, request)
    }

    request
      .then(({ workspace: currentWorkspace, role: currentRole }) => {
        if (cancelled) return
        setWorkspace(currentWorkspace)
        setRole(currentRole)
      })
      .catch(error => {
        console.error('Workspace loading failed:', error)
        workspaceRequests.current.delete(user.id)

        if (!cancelled) {
          setWorkspaceError(error.message || 'Could not load your workspace.')
        }
      })
      .finally(() => {
        if (!cancelled) setWorkspaceLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, workspaceRetry])

  async function handleLogout() {
    workspaceRequests.current.clear()
    setWorkspace(null)
    setRole(null)
    setActive('Overview')
    await supabase.auth.signOut()
  }

  if (authLoading) {
    return (
      <div className="loading-screen">
        <ShieldCheck size={30} />
        <span>Preparing BrandGuard...</span>
      </div>
    )
  }

  if (!session) {
    return authOpen
      ? <AuthScreen onBack={() => setAuthOpen(false)} />
      : <LandingPage
          onGetStarted={() => setAuthOpen(true)}
          onSignIn={() => setAuthOpen(true)}
        />
  }

  const email = session.user.email || 'Workspace member'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={23} /></div>
          <div><strong>UNWIND</strong><span>BRANDGUARD</span></div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)}><X /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="sidebar-workspace-name">
          {workspace?.name || 'Loading workspace...'}
        </div>

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
              <strong>{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Workspace member'}</strong>
              <span>{email}</span>
            </div>
            <button className="logout-button" onClick={handleLogout} title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <div className="breadcrumb">BrandGuard <span>/</span> {active}</div>
          <div className="top-status"><span className="status-dot" /> Authenticated workspace</div>
        </header>

        <div className="page">
          {workspaceLoading ? (
            <div className="content-panel loading-panel">
              Setting up your workspace...
            </div>
          ) : workspaceError ? (
            <div className="content-panel error-panel">
              <AlertTriangle size={22} />
              <h2>Workspace could not be loaded</h2>
              <p>{workspaceError}</p>
              <button
                className="secondary-button"
                onClick={() => {
                  workspaceRequests.current.delete(session.user.id)
                  setWorkspaceError('')
                  setWorkspace(null)
                  setRole(null)
                  setWorkspaceRetry(value => value + 1)
                }}
              >
                Try again
              </button>
            </div>
          ) : workspace ? (
            <>
              {active === 'Overview' && (
                <Overview
                  email={email}
                  workspace={workspace}
                  setActive={setActive}
                />
              )}

              {active === 'Brand Guidelines' && (
                <GuidelinesPage workspace={workspace} role={role} />
              )}

              {active === 'Content Reviews' && (
                <Placeholder
                  eyebrow="CONTENT GOVERNANCE"
                  title="Content Reviews"
                  description="Submit content for review before it reaches your audience."
                  icon={FileSearch}
                  items={[
                    'Marketing copy',
                    'Social media posts',
                    'Email campaigns',
                    'Website content'
                  ]}
                  action="Start a content review"
                />
              )}

              {active === 'Insights' && (
                <Placeholder
                  eyebrow="GOVERNANCE INTELLIGENCE"
                  title="Insights"
                  description="Understand recurring brand inconsistencies and review outcomes."
                  icon={ChartNoAxesCombined}
                  items={[
                    'Common brand violations',
                    'Review trends',
                    'Approval activity',
                    'Content consistency'
                  ]}
                />
              )}

              {active === 'Settings' && (
                <Placeholder
                  eyebrow="WORKSPACE CONFIGURATION"
                  title="Settings"
                  description="Manage your workspace and account preferences."
                  icon={Settings}
                  items={[
                    'Account information',
                    'Workspace preferences',
                    'Access and permissions'
                  ]}
                />
              )}
            </>
          ) : null}
        </div>

        <footer>
          UNWIND BRANDGUARD <span>·</span> Prototype v0.4
          <span>·</span> AI-assisted, human-controlled governance
        </footer>
      </main>
    </div>
  )
}

function Overview({ workspace, setActive }) {
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
        <div className="welcome-icon"><ShieldCheck size={65} /></div>
      </section>

      <section className="stats-grid">
        <Stat icon={BookOpen} label="Brand guidelines" value="—" note="Standards configured" />
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
            <div>
              <span>01</span>
              <div><strong>Define your brand</strong><p>Add voice, terminology, facts and content rules.</p></div>
              <button onClick={() => setActive('Brand Guidelines')}><ArrowRight size={17} /></button>
            </div>
            <div>
              <span>02</span>
              <div><strong>Submit content</strong><p>Send copy for a guideline-based review.</p></div>
              <button onClick={() => setActive('Content Reviews')}><ArrowRight size={17} /></button>
            </div>
            <div>
              <span>03</span>
              <div><strong>Review and approve</strong><p>Inspect findings and decide what gets approved.</p></div>
              <button onClick={() => setActive('Content Reviews')}><ArrowRight size={17} /></button>
            </div>
          </div>
        </div>

        <div className="content-panel insight-panel">
          <div className="eyebrow">OUR PRINCIPLE</div>
          <div className="insight-icon"><LockKeyhole size={21} /></div>
          <h2>AI assists. Humans decide.</h2>
          <p>
            BrandGuard helps identify inconsistencies and suggest corrections.
            Final content approval always remains with an authorised human reviewer.
          </p>
          <div className="insight-tag"><ShieldCheck size={14} /> Human-controlled governance</div>
        </div>
      </section>
    </>
  )
}

function GuidelinesPage({ workspace, role }) {
  const [guidelines, setGuidelines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const canManage = ['owner', 'admin', 'editor'].includes(role)

  const [form, setForm] = useState({
    title: '',
    category: 'voice_tone',
    content: '',
    source_reference: '',
  })

  async function loadGuidelines() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('brand_guidelines')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setGuidelines(data || [])

    setLoading(false)
  }

  useEffect(() => {
    loadGuidelines()
  }, [workspace.id])

  function openCreate() {
    setEditing(null)
    setForm({
      title: '',
      category: 'voice_tone',
      content: '',
      source_reference: ''
    })
    setError('')
    setNotice('')
    setEditorOpen(true)
  }

  function openEdit(guideline) {
    setEditing(guideline)
    setForm({
      title: guideline.title,
      category: guideline.category,
      content: guideline.content,
      source_reference: guideline.source_reference || '',
    })
    setError('')
    setNotice('')
    setEditorOpen(true)
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    const values = {
      title: form.title.trim(),
      category: form.category,
      content: form.content.trim(),
      source_reference: form.source_reference.trim() || null,
    }

    try {
      if (editing) {
        const { error } = await supabase
          .from('brand_guidelines')
          .update(values)
          .eq('id', editing.id)
          .eq('workspace_id', workspace.id)

        if (error) throw error
        setNotice('Guideline updated successfully.')
      } else {
        const { data: userData, error: userError } =
          await supabase.auth.getUser()

        if (userError) throw userError
        if (!userData.user) throw new Error('Please sign in again.')

        const { error } = await supabase
          .from('brand_guidelines')
          .insert({
            ...values,
            workspace_id: workspace.id,
            created_by: userData.user.id,
          })

        if (error) throw error
        setNotice('Guideline created successfully.')
      }

      setEditorOpen(false)
      await loadGuidelines()
    } catch (err) {
      setError(err.message || 'Could not save this guideline.')
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(guideline, status) {
    setError('')
    setNotice('')

    const { error } = await supabase
      .from('brand_guidelines')
      .update({ status })
      .eq('id', guideline.id)
      .eq('workspace_id', workspace.id)

    if (error) {
      setError(error.message)
      return
    }

    setNotice(status === 'archived' ? 'Guideline archived.' : 'Guideline restored.')
    await loadGuidelines()
  }

  const visibleGuidelines = guidelines.filter(item => {
    const matchesStatus = showArchived
      ? item.status === 'archived'
      : item.status === 'active'

    const term = search.toLowerCase()
    const matchesSearch = !term ||
      item.title.toLowerCase().includes(term) ||
      item.content.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)

    return matchesStatus && matchesSearch
  })

  return (
    <>
      <div className="page-heading guidelines-heading">
        <div>
          <div className="eyebrow">BRAND KNOWLEDGE</div>
          <h1>Brand Guidelines</h1>
          <p>Define the standards every piece of brand content should follow.</p>
        </div>
        {canManage && (
          <button className="primary-button" onClick={openCreate}>
            <Plus size={17} /> Add guideline
          </button>
        )}
      </div>

      <div className="guideline-toolbar">
        <div className="guideline-search">
          <Search size={17} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guidelines..."
          />
        </div>
        <div className="guideline-tabs">
          <button
            className={!showArchived ? 'active' : ''}
            onClick={() => setShowArchived(false)}
          >Active</button>
          <button
            className={showArchived ? 'active' : ''}
            onClick={() => setShowArchived(true)}
          >Archived</button>
        </div>
      </div>

      {error && <div className="inline-error"><AlertTriangle size={16} />{error}</div>}
      {notice && <div className="inline-success"><CheckCircle2 size={16} />{notice}</div>}

      {loading ? (
        <div className="content-panel loading-panel">Loading brand guidelines...</div>
      ) : visibleGuidelines.length === 0 ? (
        <section className="content-panel empty-guidelines">
          <div className="placeholder-icon"><BookOpen size={27} /></div>
          <h2>
            {search
              ? 'No matching guidelines'
              : showArchived
                ? 'No archived guidelines'
                : 'Your brand knowledge starts here.'}
          </h2>
          <p>
            {search
              ? 'Try a different search term.'
              : showArchived
                ? 'Guidelines you archive will appear here.'
                : 'Add your first brand rule, approved fact, terminology preference or prohibited claim.'}
          </p>
          {!showArchived && !search && canManage && (
            <button className="primary-button" onClick={openCreate}>
              <Plus size={17} /> Create first guideline
            </button>
          )}
        </section>
      ) : (
        <section className="guideline-list">
          {visibleGuidelines.map(guideline => (
            <article className="content-panel guideline-card" key={guideline.id}>
              <div className="guideline-card-top">
                <span className="category-label">
                  {categories.find(item => item.value === guideline.category)?.label || 'Other'}
                </span>
                <span className={`guideline-status ${guideline.status}`}>
                  {guideline.status}
                </span>
              </div>
              <h2>{guideline.title}</h2>
              <p className="guideline-content">{guideline.content}</p>
              {guideline.source_reference && (
                <div className="guideline-source">
                  <span>Source:</span> {guideline.source_reference}
                </div>
              )}
              <div className="guideline-card-bottom">
                <span>Updated {new Date(guideline.updated_at).toLocaleDateString()}</span>
                {canManage && (
                  <div className="guideline-actions">
                    {!showArchived && (
                      <button onClick={() => openEdit(guideline)}>
                        <Pencil size={14} /> Edit
                      </button>
                    )}
                    <button onClick={() => changeStatus(
                      guideline,
                      showArchived ? 'active' : 'archived'
                    )}>
                      {showArchived
                        ? <RotateCcw size={14} />
                        : <Archive size={14} />}
                      {showArchived ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {editorOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !saving) {
              setEditorOpen(false)
            }
          }}
        >
          <section className="guideline-modal">
            <div className="modal-heading">
              <div>
                <div className="eyebrow">
                  {editing ? 'UPDATE BRAND KNOWLEDGE' : 'ADD BRAND KNOWLEDGE'}
                </div>
                <h2>{editing ? 'Edit guideline' : 'Create a guideline'}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setEditorOpen(false)}
                disabled={saving}
              ><X size={19} /></button>
            </div>

            <form className="guideline-form" onSubmit={handleSave}>
              <label>Guideline title</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Use a reassuring and supportive tone"
                maxLength={120}
                required
              />

              <label>Category</label>
              <div className="select-wrap">
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map(category => (
                    <option value={category.value} key={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>

              <label>Guideline details</label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Describe the rule clearly. Include examples or conditions where useful."
                rows={5}
                maxLength={5000}
                required
              />

              <label>Source reference <span>(optional)</span></label>
              <input
                value={form.source_reference}
                onChange={e => setForm({ ...form, source_reference: e.target.value })}
                placeholder="e.g. Brand handbook, page 4 or https://..."
                maxLength={500}
              />

              {error && <div className="auth-error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditorOpen(false)}
                  disabled={saving}
                >Cancel</button>
                <button type="submit" className="primary-button" disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : editing ? 'Save changes' : 'Save guideline'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}

function Placeholder({ eyebrow, title, description, icon: Icon, items, action }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <section className="content-panel placeholder-panel">
        <div className="placeholder-icon"><Icon size={28} /></div>
        <h2>{action || 'Coming in the next milestone'}</h2>
        <p>
          This section is part of the BrandGuard governance workflow.
          We'll connect its functionality in the upcoming milestones.
        </p>
        <div className="feature-list">
          {items.map(item => (
            <div key={item}><CheckCircle2 size={16} />{item}</div>
          ))}
        </div>
        <span className="coming-soon"><Clock3 size={14} /> Implementation in progress</span>
      </section>
    </>
  )
}

function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span>{label}</span><Icon size={18} /></div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}

export default App
