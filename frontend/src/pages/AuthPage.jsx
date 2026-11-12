
import { useState } from 'react'
import {
  ShieldCheck,
  LockKeyhole,
  Mail,
  ArrowRight
} from 'lucide-react'
import { supabase } from '../supabase'

export default function AuthPage({ onBack }) {
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
          password
        })

        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })

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
          <div className="brand-icon">
            <ShieldCheck size={25} />
          </div>
          <div>
            <strong>UNWIND</strong>
            <span>BRANDGUARD</span>
          </div>
        </div>

        <div className="eyebrow">BRAND GOVERNANCE PLATFORM</div>

        <h1>
          {mode === 'login'
            ? 'Welcome back.'
            : 'Create your workspace.'}
        </h1>

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

          <button
            className="primary-button auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}

            <ArrowRight size={17} />
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}

          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
              setMessage('')
            }}
          >
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
