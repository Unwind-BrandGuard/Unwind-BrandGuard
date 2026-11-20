import { useEffect, useMemo, useState } from 'react'
import BrandDNAIcon from '../components/BrandDNAIcon.jsx'
import {
  ShieldCheck,
  BookOpen,
  FileSearch,
  CheckCircle2,
  Activity,
  ArrowRight,
  LockKeyhole,
  AlertTriangle,
  Clock3,
  XCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../supabase'

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

function getFindings(findings) {
  return Array.isArray(findings) ? findings : []
}

export default function OverviewPage({ workspace, setActive }) {
  const [reviews, setReviews] = useState([])
  const [guidelines, setGuidelines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAnalytics() {
      if (!workspace?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const [reviewsResult, guidelinesResult] = await Promise.all([
        supabase
          .from('content_reviews')
          .select('id, status, findings, content_type, created_at, reviewed_at')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('brand_guidelines')
          .select('id, status')
          .eq('workspace_id', workspace.id)
      ])

      if (cancelled) return

      if (reviewsResult.error || guidelinesResult.error) {
        setError(
          reviewsResult.error?.message ||
          guidelinesResult.error?.message ||
          'Unable to load workspace analytics.'
        )
      } else {
        setReviews(reviewsResult.data || [])
        setGuidelines(guidelinesResult.data || [])
      }

      setLoading(false)
    }

    loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [workspace?.id])

  const analytics = useMemo(() => {
    const total = reviews.length
    const approved = reviews.filter(r => r.status === 'approved').length
    const rejected = reviews.filter(r => r.status === 'rejected').length
    const pending = reviews.filter(r =>
      ['pending', 'in_review', 'changes_requested'].includes(r.status)
    ).length

    const allFindings = reviews.flatMap(review =>
      getFindings(review.findings)
    )

    const severityCounts = {
      high: allFindings.filter(f => f.severity?.toLowerCase() === 'high').length,
      medium: allFindings.filter(f => f.severity?.toLowerCase() === 'medium').length,
      low: allFindings.filter(f => f.severity?.toLowerCase() === 'low').length
    }

    const categoryCounts = {}
    allFindings.forEach(finding => {
      const category = finding.category || 'other'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Estimated content score: average review score.
    // High finding = 15 points, medium = 8, low = 3.
    const reviewScores = reviews.map(review => {
      const findings = getFindings(review.findings)

      const deductions = findings.reduce((total, finding) => {
        const severity = finding.severity?.toLowerCase()

        if (severity === 'high') return total + 15
        if (severity === 'medium') return total + 8
        if (severity === 'low') return total + 3

        return total
      }, 0)

      return Math.max(0, 100 - deductions)
    })

    const complianceScore = total
      ? Math.round(
          reviewScores.reduce((sum, score) => sum + score, 0) / total
        )
      : 0

    const approvalRate = total
      ? Math.round((approved / total) * 100)
      : 0

    const activeGuidelines = guidelines.filter(
      guideline => guideline.status?.toLowerCase() === 'active'
    ).length

    // Last seven calendar days, including today.
    const today = new Date()
    const trend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (6 - index))

      const dateKey = date.toLocaleDateString('en-CA')

      const count = reviews.filter(review => {
        const created = new Date(review.created_at)
        return created.toLocaleDateString('en-CA') === dateKey
      }).length

      return {
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        count
      }
    })

    return {
      total,
      approved,
      rejected,
      pending,
      findingCount: allFindings.length,
      severityCounts,
      topCategories,
      complianceScore,
      approvalRate,
      activeGuidelines,
      trend
    }
  }, [reviews, guidelines])

  const maxTrend = Math.max(1, ...analytics.trend.map(day => day.count))

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
          <h2>Welcome to {workspace?.name || 'your workspace'}.</h2>
          <p>
            Monitor your brand standards, review activity and content
            consistency from one place.
          </p>

          <button
            className="primary-button"
            onClick={() => setActive('Brand Guidelines')}
          >
            Manage brand guidelines <ArrowRight size={17} />
          </button>
        </div>

    <div className="welcome-icon">
  <BrandDNAIcon size={170} />
</div>
      </section>

      {error && (
        <div className="error-panel">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-panel">
          <RefreshCw size={18} />
          Loading workspace analytics...
        </div>
      ) : (
        <>
          <section className="stats-grid">
            <Stat
              icon={BookOpen}
              label="Brand guidelines"
              value={guidelines.length}
              note={`${analytics.activeGuidelines} active guidelines`}
            />

            <Stat
              icon={FileSearch}
              label="Content reviews"
              value={analytics.total}
              note="Total submissions"
            />

            <Stat
              icon={CheckCircle2}
              label="Approved content"
              value={analytics.approved}
              note={`${analytics.approvalRate}% approval rate`}
            />

            <Stat
              icon={ShieldCheck}
              label="Compliance score"
              value={analytics.total ? `${analytics.complianceScore}%` : '—'}
              note="Estimated from finding severity"
            />
          </section>

          <section className="bottom-grid">
            <div className="content-panel">
              <div className="section-title">
                <div>
                  <h2>Review performance</h2>
                  <p>Current workspace review status</p>
                </div>
              </div>

              <div className="stats-grid">
                <Stat
                  icon={Clock3}
                  label="Awaiting action"
                  value={analytics.pending}
                  note="Pending, in review or changes requested"
                />

                <Stat
                  icon={CheckCircle2}
                  label="Approved"
                  value={analytics.approved}
                  note="Human-approved content"
                />

                <Stat
                  icon={XCircle}
                  label="Rejected"
                  value={analytics.rejected}
                  note="Rejected submissions"
                />
              </div>

              <div className="section-title" style={{ marginTop: 28 }}>
                <div>
                  <h2>Compliance trends</h2>
                  <p>Content submissions over the last seven days</p>
                </div>
                <TrendingUp size={19} />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'end',
                gap: 12,
                height: 150,
                padding: '18px 4px 0'
              }}>
                {analytics.trend.map((day, index) => (
                  <div
                    key={`${day.label}-${index}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      height: '100%',
                      justifyContent: 'end'
                    }}
                  >
                    <small>{day.count}</small>
                    <div style={{
                      width: '100%',
                      maxWidth: 34,
                      height: `${Math.max(5, (day.count / maxTrend) * 95)}px`,
                      background: 'var(--accent, #16f5d0)',
                      borderRadius: '6px 6px 2px 2px',
                      opacity: day.count ? 0.85 : 0.2
                    }} />
                    <small>{day.label}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-panel">
              <div className="section-title">
                <div>
                  <h2>Common violations</h2>
                  <p>{analytics.findingCount} findings detected</p>
                </div>
                <AlertTriangle size={19} />
              </div>

              {analytics.topCategories.length ? (
                <div style={{ display: 'grid', gap: 17 }}>
                  {analytics.topCategories.map(([category, count]) => (
                    <div key={category}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 7
                      }}>
                        <strong style={{ textTransform: 'capitalize' }}>
                          {category.replaceAll('_', ' ')}
                        </strong>
                        <span>{count}</span>
                      </div>

                      <div style={{
                        height: 7,
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 10,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(count / analytics.findingCount) * 100}%`,
                          background: 'var(--accent, #16f5d0)',
                          borderRadius: 10
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No findings recorded yet.</p>
              )}

              <div className="section-title" style={{ marginTop: 30 }}>
                <div>
                  <h2>Finding severity</h2>
                  <p>Distribution across reviewed content</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>High severity</span>
                  <strong>{analytics.severityCounts.high}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Medium severity</span>
                  <strong>{analytics.severityCounts.medium}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Low severity</span>
                  <strong>{analytics.severityCounts.low}</strong>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="bottom-grid" style={{ marginTop: 24 }}>
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
