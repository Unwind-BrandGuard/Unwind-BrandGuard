
import { useEffect, useState } from 'react'
import {
  LockKeyhole,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Info,
  X
} from 'lucide-react'

import { supabase } from '../supabase'

// ==========================================
// CODE NOVA DEMO CONFIGURATION
// ==========================================

const DEMO_EMAIL = 'info.unwindbrandguard@gmail.com'

// IMPORTANT:
// Only use a disposable, restricted demo account here.
// A password embedded in frontend JavaScript is public.
// Never use the password of your main/admin account.
const DEMO_PASSWORD = 'Unwind@123'

// Demo visibility window: IST
const DEMO_START_AT = '2026-11-22T00:00:00+05:30'
const DEMO_END_AT = '2026-12-03T00:00:00+05:30'

function isDemoAvailable() {
  const now = Date.now()
  const start = Date.parse(DEMO_START_AT)
  const end = Date.parse(DEMO_END_AT)

  return now >= start && now < end
}

export default function LoginPage({
  onBack,
  onSignup,
  invitationMode = false,
  demoMode = false
}) {
  // ==========================================
  // STATE
  // ==========================================

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [judgeMode, setJudgeMode] = useState(false)
  const [showDemoInfo, setShowDemoInfo] = useState(false)

  const [demoAvailable, setDemoAvailable] = useState(
    () => isDemoAvailable()
  )

  const activeJudgeMode =
    judgeMode && demoAvailable && !invitationMode

  // ==========================================
  // CHECK DEMO EXPIRATION
  // ==========================================

  useEffect(() => {
    const updateAvailability = () => {
      setDemoAvailable(isDemoAvailable())
    }

    updateAvailability()

    const interval = window.setInterval(
      updateAvailability,
      30000
    )

    return () => window.clearInterval(interval)
  }, [])

  // ==========================================
  // HANDLE POPUP YES ACTION FROM APP.JSX
  // ==========================================

  useEffect(() => {
    if (invitationMode || !demoAvailable) {
      setJudgeMode(false)
      return
    }

    if (demoMode) {
      setJudgeMode(true)
    }
  }, [demoMode, invitationMode, demoAvailable])

  // ==========================================
  // SYNC DEMO CREDENTIALS
  // ==========================================

  useEffect(() => {
    if (!activeJudgeMode) return

    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setShowPassword(false)
    setError('')
    setMessage('')
  }, [activeJudgeMode])

  // ==========================================
  // ENTER JUDGE MODE
  // ==========================================

  function enableJudgeMode() {
    if (!isDemoAvailable() || invitationMode) return

    setJudgeMode(true)
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setShowPassword(false)

    setError('')
    setMessage('')
    setShowDemoInfo(false)
  }

  // ==========================================
  // RETURN TO NORMAL LOGIN
  // ==========================================

  function disableJudgeMode() {
    setJudgeMode(false)

    setEmail('')
    setPassword('')
    setShowPassword(false)

    setError('')
    setMessage('')
    setShowDemoInfo(false)
  }

  // ==========================================
  // SUPABASE LOGIN
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setMessage('')

    if (activeJudgeMode && !isDemoAvailable()) {
      setError('Code Nova demo access has expired.')
      setDemoAvailable(false)
      return
    }

    setLoading(true)

    try {
      const loginEmail = activeJudgeMode
        ? DEMO_EMAIL
        : email.trim().toLowerCase()

      const loginPassword = activeJudgeMode
        ? DEMO_PASSWORD
        : password

      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword
        })

      if (authError) throw authError

      // App.jsx handles successful login through
      // Supabase onAuthStateChange().
    } catch (err) {
      setError(err.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // PASSWORD RESET
  // ==========================================

  async function handleForgotPassword() {
    if (activeJudgeMode) return

    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }

    setError('')
    setMessage('')

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          { redirectTo: window.location.origin }
        )

      if (resetError) throw resetError

      setMessage(
        'Password reset instructions have been sent to your email.'
      )
    } catch (err) {
      setError(
        err.message || 'Unable to send password reset email.'
      )
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="auth-screen">

      {/* Back to landing */}

      <button
        type="button"
        className="auth-back-button"
        onClick={onBack}
      >
        <ArrowRight size={15} />
        Back to BrandGuard
      </button>

      <div className="auth-card">

        {/* Brand identity */}

        <div className="auth-brand">
          <div className="brand-icon auth-brand-icon">
            <img
              src="/brandguard-logo.png"
              alt="Unwind BrandGuard"
              className="brand-logo"
            />
          </div>

          <div>
            <strong>UNWIND</strong>
            <span>BRANDGUARD</span>
          </div>
        </div>

        {/* Heading */}

        <div className="eyebrow">
          {activeJudgeMode
            ? 'CODE NOVA — JUDGE DEMO'
            : 'BRAND GOVERNANCE PLATFORM'}
        </div>

        <h1>
          {invitationMode
            ? 'Join your team.'
            : activeJudgeMode
              ? 'Welcome, Code Nova Judge.'
              : 'Welcome back.'}
        </h1>

        <p className="auth-description">
          {invitationMode
            ? 'Sign in using the email address that received your workspace invitation.'
            : activeJudgeMode
              ? 'Your demo account is prepared. Click the button below to explore Unwind BrandGuard.'
              : 'Sign in to manage your brand standards and content reviews.'}
        </p>

        {/* Demo banner */}

        {activeJudgeMode && (
          <div className="judge-login-banner">
            <ShieldCheck size={20} />

            <div>
              <strong>Judge Demo Access</strong>
              <span>
                Explore brand guidelines, AI reviews,
                collaboration workflows and analytics.
              </span>
            </div>
          </div>
        )}

        {/* Recover from clicking No */}

        {!invitationMode &&
          demoAvailable &&
          !activeJudgeMode && (
            <button
              type="button"
              className="judge-login-entry"
              onClick={enableJudgeMode}
            >
              <ShieldCheck size={19} />

              <span>
                <strong>
                  Are you a Code Nova judge?
                </strong>

                <small>
                  Open your prepared demo login
                </small>
              </span>

              <ArrowRight size={18} />
            </button>
          )}

        {/* Login form */}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          {/* Email */}

          <label htmlFor="login-email">
            {activeJudgeMode
              ? 'Demo email'
              : 'Work email'}
          </label>

          <div
            className={`auth-input ${
              activeJudgeMode ? 'judge-locked-input' : ''
            }`}
          >
            <Mail size={17} />

            <input
              id="login-email"
              type="email"
              placeholder="you@company.com"
              value={
                activeJudgeMode
                  ? DEMO_EMAIL
                  : email
              }
              onChange={(event) => {
                if (!activeJudgeMode) {
                  setEmail(event.target.value)
                }
              }}
              readOnly={activeJudgeMode}
              autoComplete={
                activeJudgeMode ? 'off' : 'email'
              }
              required
            />

            {activeJudgeMode && (
              <LockKeyhole
                size={15}
                className="judge-field-lock"
              />
            )}
          </div>

          {/* Password */}

          <label htmlFor="login-password">
            Password
          </label>

          <div
            className={`auth-input ${
              activeJudgeMode ? 'judge-locked-input' : ''
            }`}
          >
            <LockKeyhole size={17} />

            <input
              id="login-password"
              type={
                activeJudgeMode
                  ? 'password'
                  : showPassword
                    ? 'text'
                    : 'password'
              }
              placeholder={
                activeJudgeMode
                  ? 'Demo password'
                  : 'Your password'
              }
              value={
                activeJudgeMode
                  ? DEMO_PASSWORD
                  : password
              }
              onChange={(event) => {
                if (!activeJudgeMode) {
                  setPassword(event.target.value)
                }
              }}
              readOnly={activeJudgeMode}
              autoComplete={
                activeJudgeMode
                  ? 'off'
                  : 'current-password'
              }
              required
            />

            {activeJudgeMode ? (
              <LockKeyhole
                size={15}
                className="judge-field-lock"
              />
            ) : (
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => {
                  setShowPassword(value => !value)
                }}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword
                  ? <EyeOff size={17} />
                  : <Eye size={17} />}
              </button>
            )}
          </div>

          {/* Forgot password */}

          {!activeJudgeMode && (
            <button
              type="button"
              className="auth-forgot"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          )}

          {/* Messages */}

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="auth-message"
              role="status"
            >
              {message}
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : activeJudgeMode
                ? 'Enter Judge Demo'
                : 'Sign in'}

            <ArrowRight size={17} />
          </button>
        </form>

        {/* Switch to normal sign in */}

        {activeJudgeMode && (
          <button
            type="button"
            className="judge-back-to-login"
            onClick={disableJudgeMode}
          >
            Not a judge? Use normal sign in
          </button>
        )}

        {/* Normal sign up */}

        {!activeJudgeMode && (
          <div className="auth-switch">
            Don't have an account?

            <button
              type="button"
              onClick={onSignup}
            >
              Create account
            </button>
          </div>
        )}

        {/* Security footer */}

        <div className="auth-security">
          <LockKeyhole size={14} />
          Secured with Supabase Authentication
        </div>
      </div>

      {/* Bottom-left demo info */}

      {!invitationMode && demoAvailable && (
        <>
          <button
            type="button"
            className="judge-floating-info"
            onClick={() => setShowDemoInfo(true)}
            aria-label="Code Nova demo information"
          >
            <Info size={20} />
            <span>Judge Demo</span>
          </button>

          {/* Demo information popup */}

          {showDemoInfo && (
            <div
              className="judge-info-overlay"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setShowDemoInfo(false)
                }
              }}
            >
              <div
                className="judge-info-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="judge-info-title"
              >
                <button
                  type="button"
                  className="judge-info-close"
                  onClick={() => setShowDemoInfo(false)}
                  aria-label="Close demo information"
                >
                  <X size={20} />
                </button>

                <ShieldCheck
                  size={30}
                  className="judge-info-shield"
                />

                <h2 id="judge-info-title">
                  Code Nova Judge Demo
                </h2>

                <p>
                  This temporary demonstration account
                  allows Code Nova judges to explore
                  Unwind BrandGuard without registration.
                </p>

                <p>
                  Demo access is available during
                  the two-day judging period.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={enableJudgeMode}
                >
                  Check Demo
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
