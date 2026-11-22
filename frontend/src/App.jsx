
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  FileSearch,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Menu,
  Users,
  X,
  AlertTriangle,
  CircleHelp,
  Moon,
  Sun,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'

import GuidedTour from './components/GuidedTour'
import { supabase } from './supabase'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OverviewPage from './pages/OverviewPage'
import GuidelinesPage from './pages/GuidelinesPage'
import ContentReviewsPage from './pages/ContentReviewsPage'
import InsightsPage from './pages/InsightsPage'
import SettingsPage from './pages/SettingsPage'
import TeamMembersPage from './pages/TeamMembersPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import JudgeDemoPopup from './components/JudgeDemoPopup'
import AboutPage from './pages/AboutPage'

import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Brand Guidelines', icon: BookOpen },
  { name: 'Content Reviews', icon: FileSearch },
  { name: 'Insights', icon: ChartNoAxesCombined },
  { name: 'Team Members', icon: Users },
  { name: 'Settings', icon: Settings }
]

const DEMO_START = new Date('2026-11-22T00:00:00+05:30').getTime()
const DEMO_END = new Date('2026-11-24T00:00:00+05:30').getTime()

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [tourRestart, setTourRestart] = useState(0)
  const [tourRunning, setTourRunning] = useState(false)

  const [invitationToken, setInvitationToken] = useState(
    () => new URLSearchParams(window.location.search).get('token') || ''
  )
  const [showJudgePopup, setShowJudgePopup] = useState(false)
const [judgeDemoSelected, setJudgeDemoSelected] = useState(false)

  const [authOpen, setAuthOpen] = useState(
    () => Boolean(new URLSearchParams(window.location.search).get('token'))
  )

  const [authPage, setAuthPage] = useState('login')
  const [legalPage, setLegalPage] = useState('')

  const [publicPage, setPublicPage] = useState(
    () => window.location.pathname === '/about' ? 'about' : ''
  )

  const [workspace, setWorkspace] = useState(null)
  const [role, setRole] = useState(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [workspaceRetry, setWorkspaceRetry] = useState(0)
  const [workspaceError, setWorkspaceError] = useState('')

  // Invitation profile details
  const [needsInvitationName, setNeedsInvitationName] = useState(false)
  const [invitationName, setInvitationName] = useState('')
  const [savingInvitationName, setSavingInvitationName] = useState(false)
  const [invitationNameError, setInvitationNameError] = useState('')

  // Navigation and landing page
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLanding, setShowLanding] = useState(false)

  const [demoAvailable, setDemoAvailable] = useState(
  () => Date.now() >= DEMO_START && Date.now() < DEMO_END
)

useEffect(() => {
  const update = () => {
    setDemoAvailable(
      Date.now() >= DEMO_START && Date.now() < DEMO_END
    )
  }

  const interval = setInterval(update, 30000)
  return () => clearInterval(interval)
}, [])

  // Theme management
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('brandguard-theme')

      return savedTheme === 'dark' || savedTheme === 'light'
        ? savedTheme
        : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)

    try {
      localStorage.setItem('brandguard-theme', theme)
    } catch {
      // Theme still works when browser storage is unavailable.
    }
  }, [theme])

  function toggleTheme() {
    setTheme(current => current === 'light' ? 'dark' : 'light')
  }
function openJudgeLogin() {
  setAuthPage('login')
  setAuthOpen(true)
  setJudgeDemoSelected(false)
  setShowJudgePopup(demoAvailable && !invitationToken)
}

  const workspaceRequests = useRef(new Map())

  // -----------------------------------------
  // PUBLIC PAGE NAVIGATION
  // -----------------------------------------

  function openAboutPage() {
    window.history.pushState({}, '', '/about')
    setPublicPage('about')
    setMenuOpen(false)
  }

  function closeAboutPage() {
    window.history.pushState({}, '', '/')
    setPublicPage('')
  }

  function startFromAbout(page) {
    closeAboutPage()
    setAuthPage(page)
    setAuthOpen(true)
  }

  useEffect(() => {
    function handlePopState() {
      setPublicPage(
        window.location.pathname === '/about' ? 'about' : ''
      )
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // -----------------------------------------
  // AUTHENTICATION
  // -----------------------------------------

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

      if (newSession) {
        setAuthOpen(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // -----------------------------------------
  // GUIDED TOUR RESPONSIVENESS
  // -----------------------------------------

  useEffect(() => {
    if (!tourRunning) return

    if (window.matchMedia('(max-width: 768px)').matches) {
      setMenuOpen(true)
    }

    return () => setMenuOpen(false)
  }, [tourRunning])

  // -----------------------------------------
  // SAVE INVITED USER'S NAME
  // -----------------------------------------

  async function saveInvitationName(event) {
    event.preventDefault()

    const cleanName = invitationName.trim()

    if (!cleanName) {
      setInvitationNameError('Please enter your full name.')
      return
    }

    if (cleanName.length < 2) {
      setInvitationNameError('Your name must contain at least 2 characters.')
      return
    }

    setSavingInvitationName(true)
    setInvitationNameError('')

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
          fullName: cleanName,
          name: cleanName
        }
      })

      if (error) throw error

      if (!data?.user) {
        throw new Error('Could not update your account details. Please try again.')
      }

      setNeedsInvitationName(false)
      setInvitationName('')
      setWorkspaceError('')
      setWorkspace(null)
      setRole(null)

      workspaceRequests.current.delete(data.user.id)

      setWorkspaceRetry(value => value + 1)
    } catch (error) {
      console.error('Invitation profile update failed:', error)

      setInvitationNameError(
        error.message || 'Unable to save your name. Please try again.'
      )
    } finally {
      setSavingInvitationName(false)
    }
  }

  // -----------------------------------------
  // WORKSPACE LOADING
  // -----------------------------------------

  useEffect(() => {
    const user = session?.user

    if (!user) {
      setWorkspace(null)
      setRole(null)
      setWorkspaceError('')
      setWorkspaceLoading(false)
      setNeedsInvitationName(false)
      return
    }

    let cancelled = false

    async function loadWorkspace() {
      setWorkspaceLoading(true)
      setWorkspaceError('')

      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser()

        if (authError) throw authError

        const authenticatedUser = authData.user
        const authenticatedUserId = authenticatedUser?.id

        if (!authenticatedUserId || authenticatedUserId !== user.id) {
          throw new Error(
            'Your session could not be verified. Please sign in again.'
          )
        }

        // -----------------------------------------
        // ACCEPT WORKSPACE INVITATION
        // -----------------------------------------

        // -----------------------------------------
        // CHECK EXISTING WORKSPACE MEMBERSHIP
        // -----------------------------------------

        let request = workspaceRequests.current.get(user.id)

        if (!request) {
          request = (async () => {
            const { data: memberships, error: membershipError } =
              await supabase
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
                user.user_metadata?.workspace_name?.trim() ||
                user.user_metadata?.company_name?.trim() ||
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

        const result = await request

        if (cancelled) return

        setWorkspace(result.workspace)
        setRole(result.role)
      } catch (error) {
        console.error('Workspace loading failed:', error)

        workspaceRequests.current.delete(user.id)

        if (!cancelled) {
          setWorkspaceError(
            error.message || 'Could not load your workspace.'
          )
        }
      } finally {
        if (!cancelled) {
          setWorkspaceLoading(false)
        }
      }
    }

    loadWorkspace()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, invitationToken, workspaceRetry])

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------

  async function handleLogout() {
    workspaceRequests.current.clear()

    setWorkspace(null)
    setRole(null)
    setActive('Overview')
    setNeedsInvitationName(false)
    setInvitationName('')
    setInvitationNameError('')

    await supabase.auth.signOut()
  }

  // -----------------------------------------
  // LOADING SCREEN
  // -----------------------------------------

  if (authLoading) {
    return (
      <div className="loading-screen">
        <ShieldCheck size={30} />
        <span>Preparing BrandGuard...</span>
      </div>
    )
  }

  // -----------------------------------------
  // TERMS AND PRIVACY PAGES
  // -----------------------------------------

  if (legalPage === 'terms') {
    return (
      <TermsOfServicePage
        onBack={() => setLegalPage('')}
      />
    )
  }

  if (legalPage === 'privacy') {
    return (
      <PrivacyPolicyPage
        onBack={() => setLegalPage('')}
      />
    )
  }

  // -----------------------------------------
  // PUBLIC ABOUT PAGE
  // -----------------------------------------

  if (publicPage === 'about') {
    return (
      <AboutPage
        onBack={closeAboutPage}
        onGetStarted={() => startFromAbout('signup')}
        onSignIn={() => startFromAbout('login')}
      />
    )
  }

  // -----------------------------------------
  // PUBLIC LANDING PAGE AND AUTHENTICATION
  // -----------------------------------------

  if (showLanding && session) {
  return (
    <LandingPage
      theme={theme}
      onToggleTheme={toggleTheme}
      onGetStarted={() => {
          setShowLanding(false)
          setActive('Overview')
        }}
        onSignIn={() => {
          setShowLanding(false)
          setActive('Overview')
        }}
        onAbout={() => {
          setShowLanding(false)
          openAboutPage()
        }}
        onTerms={() => {
          setShowLanding(false)
          setLegalPage('terms')
        }}
        onPrivacy={() => {
          setShowLanding(false)
          setLegalPage('privacy')
        }}
      />
    )
  }

 if (!session) {
  if (!authOpen) {
    return (
      <LandingPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onGetStarted={() => {
            setAuthPage('signup')
            setAuthOpen(true)
          }}
          onSignIn={openJudgeLogin}
          onCheckDemo={demoAvailable ? openJudgeLogin : undefined}
          onAbout={openAboutPage}
          onTerms={() => setLegalPage('terms')}
          onPrivacy={() => setLegalPage('privacy')}
        />
      )
    }

    if (authPage === 'signup') {
      return (
        <SignupPage
          invitationMode={Boolean(invitationToken)}
          invitationToken={invitationToken}
          onBack={() => setAuthOpen(false)}
          onLogin={() => setAuthPage('login')}
          onTerms={() => setLegalPage('terms')}
          onPrivacy={() => setLegalPage('privacy')}
        />
      )
    }

    return (
  <>
    {showJudgePopup && !invitationToken && (
      <JudgeDemoPopup
        onYes={() => {
          setJudgeDemoSelected(true)
          setShowJudgePopup(false)
        }}
        onNo={() => {
          setJudgeDemoSelected(false)
          setShowJudgePopup(false)
        }}
      />
    )}

    <LoginPage
      invitationMode={Boolean(invitationToken)}
      demoMode={judgeDemoSelected && !invitationToken}
      onBack={() => {
        setAuthOpen(false)
        setShowJudgePopup(false)
        setJudgeDemoSelected(false)
      }}
      onSignup={() => {
        setShowJudgePopup(false)
        setJudgeDemoSelected(false)
        setAuthPage('signup')
      }}
    />
  </>
)
  }

  // -----------------------------------------
  // AUTHENTICATED WORKSPACE
  // -----------------------------------------

  const email = session.user.email || 'Workspace member'

  const displayName =
    session.user.user_metadata?.full_name?.trim() ||
    session.user.user_metadata?.fullName?.trim() ||
    session.user.user_metadata?.name?.trim() ||
    email

  function renderPage() {
    switch (active) {
      case 'Overview':
        return (
          <OverviewPage
            workspace={workspace}
            setActive={setActive}
          />
        )

      case 'Brand Guidelines':
        return (
          <GuidelinesPage
            workspace={workspace}
            role={role}
          />
        )

      case 'Content Reviews':
        return (
          <ContentReviewsPage
            workspace={workspace}
            role={role}
          />
        )

      case 'Insights':
        return <InsightsPage workspace={workspace} />

      case 'Settings':
        return (
          <SettingsPage
            workspace={workspace}
            role={role}
            onWorkspaceUpdate={setWorkspace}
          />
        )

      case 'Team Members':
        return (
          <TeamMembersPage
            workspace={workspace}
            role={role}
          />
        )

      default:
        return (
          <OverviewPage
            workspace={workspace}
            setActive={setActive}
          />
        )
    }
  }

  return (
    <div className="app-shell">
      {workspace && !workspaceLoading && !workspaceError && (
        <GuidedTour
          userId={session.user.id}
          workspaceId={workspace.id}
          restartSignal={tourRestart}
          onRunningChange={setTourRunning}
        />
      )}

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <button
            type="button"
            className="brand-home-button"
            onClick={() => {
              setShowLanding(true)
              setMenuOpen(false)
            }}
            title="Visit BrandGuard homepage"
            aria-label="Go to BrandGuard landing page"
          >
            <div className="brand-icon">
              <img
                src="/brandguard-logo.png"
                alt=""
                className="brand-logo"
              />
            </div>

            <div className="brand-home-text">
              <strong>UNWIND</strong>
              <span>BRANDGUARD</span>
            </div>
          </button>

          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <div className="sidebar-workspace-name">
          {workspace?.name || 'Loading workspace...'}
        </div>

        <nav>
          {navigation.map(item => (
            <button
              key={item.name}
              data-tour={{
                'Overview': 'overview',
                'Brand Guidelines': 'guidelines',
                'Content Reviews': 'reviews',
                'Insights': 'insights',
                'Team Members': 'members',
                'Settings': 'settings'
              }[item.name]}
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
          <button
            type="button"
            className="sidebar-tour-button"
            onClick={() => {
              setActive('Overview')
              setMenuOpen(false)
              setTourRestart(value => value + 1)
            }}
          >
            <CircleHelp size={19} />

            <span className="sidebar-tour-copy">
              <strong>Take a Tour</strong>
              <small>Explore BrandGuard</small>
            </span>

            <ArrowUpRight size={17} />
          </button>

          <div className="profile">
            <div className="avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="profile-details">
              <strong>
                {role
                  ? role.charAt(0).toUpperCase() + role.slice(1)
                  : 'Workspace member'}
              </strong>

              <span>{displayName}</span>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>

          <div className="breadcrumb">
            BrandGuard <span>/</span> {active}
          </div>

          

          <div className="topbar-right">
            <div className="top-status">
              <span className="status-dot" />
              Authenticated workspace
            </div>

           <button
  type="button"
  className="theme-toggle"
  onClick={() => {
    console.log('THEME BUTTON CLICKED')
    toggleTheme()
  }}
  aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
>
  {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
  <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
</button>
          </div>
        </header>

        <div className="page">
          {workspaceLoading ? (
            <div className="content-panel loading-panel">
              {invitationToken
                ? 'Validating your workspace invitation...'
                : 'Setting up your workspace...'}
            </div>
          ) : needsInvitationName ? (
            <div className="content-panel">
              <div style={{
                maxWidth: '460px',
                margin: '40px auto',
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: '18px' }}>
                  <ShieldCheck size={38} />
                </div>

                <h2>Complete Your Profile</h2>

                <p>
                  Before joining this workspace, please enter your full name.
                  It will be displayed in review comments and team activity.
                </p>

                <form
                  onSubmit={saveInvitationName}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    marginTop: '24px',
                    textAlign: 'left'
                  }}
                >
                  <label htmlFor="invitation-full-name">
                    Full Name
                  </label>

                  <input
                    id="invitation-full-name"
                    type="text"
                    value={invitationName}
                    onChange={event => {
                      setInvitationName(event.target.value)
                      setInvitationNameError('')
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #333)',
                      background: 'var(--input-background, transparent)',
                      color: 'inherit',
                      font: 'inherit'
                    }}
                  />

                  {invitationNameError && (
                    <p
                      role="alert"
                      style={{ color: '#e57373', margin: 0 }}
                    >
                      {invitationNameError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="secondary-button"
                    disabled={savingInvitationName}
                  >
                    {savingInvitationName
                      ? 'Saving your details...'
                      : 'Save Name and Accept Invitation'}
                  </button>
                </form>
              </div>
            </div>
          ) : workspaceError ? (
            <div className="content-panel error-panel">
              <AlertTriangle size={22} />

              <h2>
                {invitationToken
                  ? 'Invitation could not be accepted'
                  : 'Workspace could not be loaded'}
              </h2>

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

              {invitationToken && (
                <button
                  className="secondary-button"
                  onClick={handleLogout}
                >
                  Sign out and switch account
                </button>
              )}
            </div>
          ) : workspace ? (
            renderPage()
          ) : null}
        </div>

        <footer className="app-footer">
          <span>
            UNWIND BRANDGUARD <span>·</span> 
            <span>·</span> AI-assisted, human-controlled governance
          </span>

          <div className="app-legal-links">
            <button onClick={() => setLegalPage('terms')}>
              Terms of Service
            </button>

            <button onClick={() => setLegalPage('privacy')}>
              Privacy Policy
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}
