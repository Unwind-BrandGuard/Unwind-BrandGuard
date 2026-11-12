
import { useState } from 'react'
import {
  ShieldCheck, LockKeyhole, Mail, ArrowRight, Eye, EyeOff
} from 'lucide-react'
import { supabase } from '../supabase'

export default function LoginPage({ onBack, onSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) throw error
    } catch (err) {
      setError(err.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }

    setError('')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: window.location.origin }
    )

    if (error) setError(error.message)
    else setMessage('Password reset instructions have been sent to your email.')
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
        <h1>Welcome back.</h1>
        <p className="auth-description">
          Sign in to manage your brand standards and content reviews.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
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

          <button
            type="button"
            className="auth-forgot"
            onClick={handleForgotPassword}
          >
            Forgot password?
          </button>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}

          <button className="primary-button auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?
          <button onClick={onSignup}>Create account</button>
        </div>

        <div className="auth-security">
          <LockKeyhole size={14} />
          Secured with Supabase Authentication
        </div>
      </div>
    </main>
  )
}