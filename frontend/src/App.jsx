
import { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  FileSearch,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react'

import { supabase } from './supabase'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OverviewPage from './pages/OverviewPage'
import GuidelinesPage from './pages/GuidelinesPage'
import ContentReviewsPage from './pages/ContentReviewsPage'
import InsightsPage from './pages/InsightsPage'
import SettingsPage from './pages/SettingsPage'

import './App.css'

const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Brand Guidelines', icon: BookOpen },
  { name: 'Content Reviews', icon: FileSearch },
  { name: 'Insights', icon: ChartNoAxesCombined },
  { name: 'Settings', icon: Settings },
]

export default function App() {
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
          throw new Error(
            'Your session could not be verified. Please sign in again.'
          )
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
          setWorkspaceError(
            error.message || 'Could not load your workspace.'
          )
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
      ? <AuthPage onBack={() => setAuthOpen(false)} />
      : (
        <LandingPage
          onGetStarted={() => setAuthOpen(true)}
          onSignIn={() => setAuthOpen(true)}
        />
      )
  }

  const email = session.user.email || 'Workspace member'

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
        return <GuidelinesPage workspace={workspace} role={role} />

      case 'Content Reviews':
  return <ContentReviewsPage workspace={workspace} role={role} />

     case 'Insights':
  return <InsightsPage workspace={workspace} />;

      case 'Settings':
        return <SettingsPage workspace={workspace} role={role} />

      default:
        return <OverviewPage workspace={workspace} setActive={setActive} />
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={23} />
          </div>

          <div>
            <strong>UNWIND</strong>
            <span>BRANDGUARD</span>
          </div>

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
            <div className="avatar">
              {email.charAt(0).toUpperCase()}
            </div>

            <div className="profile-details">
              <strong>
                {role
                  ? role.charAt(0).toUpperCase() + role.slice(1)
                  : 'Workspace member'}
              </strong>
              <span>{email}</span>
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

          <div className="top-status">
            <span className="status-dot" />
            Authenticated workspace
          </div>
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
            renderPage()
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
