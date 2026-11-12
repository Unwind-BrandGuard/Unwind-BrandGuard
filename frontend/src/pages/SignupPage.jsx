
import { useState } from 'react'
import {
  ShieldCheck, LockKeyhole, Mail, ArrowRight,
  UserRound, Building2, Eye, EyeOff
} from 'lucide-react'
import { supabase } from '../supabase'

export default function SignupPage({ onBack, onLogin }) {
  const [fullName, setFullName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: workspaceName.trim(),
            workspace_name: workspaceName.trim()
          }
        }
      })

      if (error) throw error

      setMessage(
        data.session
          ? 'Account created successfully. Your workspace is being prepared.'
          : 'Account created! Please verify your email, then sign in to access your workspace.'
      )
    } catch (err) {
      setError(err.message || 'Unable to create your account.')
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

        <div className="eyebrow">GET STARTED WITH BRANDGUARD</div>
        <h1>Create your workspace.</h1>
        <p className="auth-description">
          Set up your account and establish your organisation's brand governance space.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full name</label>
          <div className="auth-input">
            <UserRound size={17} />
            <input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <label>Company / Brand name</label>
          <div className="auth-input">
            <Building2 size={17} />
            <input
              type="text"
              placeholder="Your company or brand"
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <small className="auth-field-hint">
            This will be your workspace name. You can change it later.
          </small>

          <label>Work email</label>
          <div className="auth-input">
            <Mail size={17} />
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label>Password</label>
          <div className="auth-input">
            <LockKeyhole size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <label>Confirm password</label>
          <div className="auth-input">
            <LockKeyhole size={17} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowConfirmPassword(v => !v)}
            >
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <label className="auth-terms">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
            />
            <span>
              I agree to the Terms of Service and Privacy Policy.
            </span>
          </label>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}

          <button className="primary-button auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?
          <button onClick={onLogin}>Sign in</button>
        </div>

        <div className="auth-security">
          <LockKeyhole size={14} />
          Secured with Supabase Authentication
        </div>
      </div>
    </main>
  )
}
