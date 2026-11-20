
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ChartNoAxesCombined,
  Clock3,
  FileSearch,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { supabase } from '../supabase'
import ErrorState from '../components/feedback/ErrorState'
import { getFriendlyError } from '../utils/errorMessages'
import './InsightsPage.css'

const CHART_COLORS = {
  light: {
    approved: '#4e8262',
    pending: '#8299b6',
    changes_requested: '#c49a5d',
    rejected: '#c27b75',
    other: '#a3aaa1',
  },
  dark: {
    approved: '#a0c9a9',
    pending: '#a9bbdc',
    changes_requested: '#e1bf85',
    rejected: '#e2a29d',
    other: '#85988b',
  },
}

const CHART_THEME = {
  light: {
    accent: '#4e8262',
    grid: '#e1e5dc',
    muted: '#718076',
    tooltipBg: '#ffffff',
    text: '#263a30',
  },
  dark: {
    accent: '#a0c9a9',
    grid: '#35463a',
    muted: '#a1b2a5',
    tooltipBg: '#1b2720',
    text: '#e9eee7',
  },
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatStatus(status) {
  return String(status || 'unknown').replaceAll('_', ' ')
}

export default function InsightsPage({ workspace }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState(30)
  const [refreshing, setRefreshing] = useState(false)

const [theme, setTheme] = useState(
  () => document.documentElement.getAttribute('data-theme') || 'light'
)

useEffect(() => {
  const root = document.documentElement

  const syncTheme = () => {
    setTheme(
      root.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light'
    )
  }

  syncTheme()

  const observer = new MutationObserver(syncTheme)

  observer.observe(root, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  return () => observer.disconnect()
}, [])

const colors = CHART_COLORS[theme]
const chartTheme = CHART_THEME[theme]

const tooltipStyle = {
  backgroundColor: chartTheme.tooltipBg,
  border: `1px solid ${chartTheme.grid}`,
  borderRadius: 12,
  color: chartTheme.text,
  fontFamily: 'Manrope, sans-serif',
  fontSize: 12,
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
}

const workspaceId = workspace?.id

  const loadInsights = useCallback(async (showLoader = true) => {
    if (!workspaceId) {
      setReviews([])
      setLoading(false)
      return
    }

    if (showLoader) setLoading(true)
    else setRefreshing(true)

    setError('')

    try {
      const { data, error: queryError } = await supabase
        .from('content_reviews')
        .select('id, title, status, findings, created_at, reviewed_at')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      setReviews(data || [])
    } catch (err) {
      console.error('Insights loading failed:', err)

      setError(
        getFriendlyError(
          err,
          'We could not load your brand insights. Please try again.'
        )
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [workspaceId])

  useEffect(() => {
    loadInsights()
  }, [loadInsights])

  // Selected date range
  const filteredReviews = useMemo(() => {
    const cutoff = new Date()
    cutoff.setHours(0, 0, 0, 0)
    cutoff.setDate(cutoff.getDate() - dateRange + 1)

    return reviews.filter((review) => {
      const date = new Date(review.created_at)

      return (
        !Number.isNaN(date.getTime()) &&
        date >= cutoff
      )
    })
  }, [reviews, dateRange])

  // Summary statistics
  const stats = useMemo(() => {
    const total = filteredReviews.length

    const approved = filteredReviews.filter(
      (review) => review.status === 'approved'
    ).length

    const rejected = filteredReviews.filter(
      (review) => review.status === 'rejected'
    ).length

    const changes = filteredReviews.filter(
      (review) => review.status === 'changes_requested'
    ).length

    const pending = filteredReviews.filter(
      (review) => ['pending', 'in_review'].includes(review.status)
    ).length

    const decisions = approved + rejected + changes

    const findings = filteredReviews.flatMap((review) =>
      Array.isArray(review.findings) ? review.findings : []
    )

    const categories = {}

    findings.forEach((finding) => {
      const category = String(finding?.category || 'other')
      categories[category] = (categories[category] || 0) + 1
    })

    const categoryList = Object.entries(categories)
      .map(([name, count]) => ({
        name: name.replaceAll('_', ' '),
        count,
      }))
      .sort((a, b) => b.count - a.count)

    const highSeverity = findings.filter(
      (finding) => finding?.severity === 'high'
    ).length

    return {
      total,
      approved,
      rejected,
      changes,
      pending,
      decisions,
      approvalRate: decisions
        ? Math.round((approved / decisions) * 100)
        : null,
      findingCount: findings.length,
      highSeverity,
      categoryList,
    }
  }, [filteredReviews])

  // Activity graph: actual daily submissions
  const activityData = useMemo(() => {
    const days = []

    for (let i = dateRange - 1; i >= 0; i--) {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - i)

      days.push({
        key: dateKey(date),
        date: date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        }),
        submissions: 0,
      })
    }

    const lookup = new Map(
      days.map((day) => [day.key, day])
    )

    filteredReviews.forEach((review) => {
      const date = new Date(review.created_at)
      const day = lookup.get(dateKey(date))

      if (day) day.submissions += 1
    })

    return days
  }, [filteredReviews, dateRange])

 // Donut chart — theme-aware and immutable
const outcomeData = useMemo(() => {
  const items = [
    {
      name: 'Approved',
      value: stats.approved,
      color: colors.approved,
    },
    {
      name: 'Pending / in review',
      value: stats.pending,
      color: colors.pending,
    },
    {
      name: 'Changes requested',
      value: stats.changes,
      color: colors.changes_requested,
    },
    {
      name: 'Rejected',
      value: stats.rejected,
      color: colors.rejected,
    },
  ].filter(item => item.value > 0)

  const classified = items.reduce(
    (sum, item) => sum + item.value,
    0
  )

  const otherCount = Math.max(0, stats.total - classified)

  if (otherCount > 0) {
    items.push({
      name: 'Other',
      value: otherCount,
      color: colors.other,
    })
  }

  return items
}, [stats, colors])

  if (loading) {
    return (
      <div className="ins-loading">
        <RefreshCw size={19} className="ins-spinning" />
        Loading governance insights...
      </div>
    )
  }

  if (error) {
    return (
      <div className="ins-page">
        <ErrorState
          title="Insights are unavailable"
          message={error}
          onRetry={() => loadInsights()}
          retrying={loading}
        />
      </div>
    )
  }

  return (
    <div className="ins-page">
      {/* Dashboard heading */}
      <div className="page-heading ins-heading">
        <div>
          <div className="eyebrow">
            GOVERNANCE INTELLIGENCE
          </div>

          <h1>Brand Intelligence</h1>

          <p>
            Monitor content reviews, brand violations,
            and compliance decisions.
          </p>
        </div>

        <div className="ins-toolbar">
          <div
            className="ins-date-filters"
            role="group"
            aria-label="Analytics date range"
          >
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                className={`ins-filter-btn ${
                  dateRange === days ? 'active' : ''
                }`}
                aria-pressed={dateRange === days}
                onClick={() => setDateRange(days)}
              >
                {days}D
              </button>
            ))}
          </div>

          <button
            type="button"
            className="ins-refresh"
            onClick={() => loadInsights(false)}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'ins-spinning' : ''}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="ins-stats">
        <article className="ins-card">
          <span>Total reviews</span>

          <div>
            <FileSearch size={20} />
            <strong>{stats.total}</strong>
          </div>

          <small>Submissions in selected period</small>
        </article>

        <article className="ins-card">
          <span>Pending reviews</span>

          <div>
            <Clock3 size={20} />
            <strong>{stats.pending}</strong>
          </div>

          <small>Awaiting a final decision</small>
        </article>

        <article className="ins-card">
          <span>Approval rate</span>

          <div>
            <ShieldCheck size={20} />
            <strong>
              {stats.approvalRate === null
                ? '—'
                : `${stats.approvalRate}%`}
            </strong>
          </div>

          <small>
            {stats.decisions} completed decisions
          </small>
        </article>

        <article className="ins-card">
          <span>Detected issues</span>

          <div>
            <AlertTriangle size={20} />
            <strong>{stats.findingCount}</strong>
          </div>

          <small>
            {stats.highSeverity} high-severity findings
          </small>
        </article>
      </div>

      {/* Daily activity */}
      <section className="content-panel ins-panel ins-activity-panel">
        <div className="ins-panel-heading">
          <div>
            <h2>Content review activity</h2>
            <p>
              Daily submissions over the last {dateRange} days
            </p>
          </div>

          <Activity size={20} />
        </div>

        {stats.total === 0 ? (
          <div className="ins-empty ins-chart-empty">
            No content reviews submitted in this period.
          </div>
        ) : (
          <div className="ins-chart-container">
            <ResponsiveContainer width="100%" height={270}>
              <AreaChart
                data={activityData}
                margin={{
                  top: 10,
                  right: 15,
                  left: -15,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="insActivityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                   <stop
  offset="0%"
  stopColor={chartTheme.accent}
  stopOpacity={0.22}
/>
<stop
  offset="100%"
  stopColor={chartTheme.accent}
  stopOpacity={0}
/>
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke={chartTheme.grid}
                  strokeDasharray="3 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  stroke={chartTheme.muted}
                  tick={{ fontSize: 11 }}
                  minTickGap={25}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke={chartTheme.muted}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                />

                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ stroke: '#36564d' }}
                />

                <Area
                  type="monotone"
                  dataKey="submissions"
                  name="Submissions"
                  stroke="#16f5d0"
                  strokeWidth={3}
                  fill="url(#insActivityGradient)"
                  dot={false}
activeDot={{
  r: 5,
  fill: chartTheme.accent,
  stroke: chartTheme.tooltipBg,
  strokeWidth: 2,
}}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Outcomes and violations */}
      <div className="ins-grid">
        <section className="content-panel ins-panel">
          <div className="ins-panel-heading">
            <div>
              <h2>Review outcomes</h2>
              <p>Status distribution for this period</p>
            </div>

            <ShieldCheck size={20} />
          </div>

          {outcomeData.length === 0 ? (
            <div className="ins-empty ins-chart-empty">
              No review outcomes recorded yet.
            </div>
          ) : (
            <>
              <div className="ins-donut-wrap">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {outcomeData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="ins-donut-center">
                  <strong>{stats.total}</strong>
                  <span>Reviews</span>
                </div>
              </div>

              <div className="ins-chart-legend">
                {outcomeData.map((item) => (
                  <div key={item.name}>
                    <span>
                      <i
                        style={{
                          background: item.color,
                        }}
                      />
                      {item.name}
                    </span>

                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="content-panel ins-panel">
          <div className="ins-panel-heading">
            <div>
              <h2>Recurring brand violations</h2>
              <p>Most frequently detected issue categories</p>
            </div>

            <ChartNoAxesCombined size={20} />
          </div>

          {stats.categoryList.length === 0 ? (
            <div className="ins-empty ins-chart-empty">
              No brand violations recorded for this period.
            </div>
          ) : (
            <div className="ins-violations-chart">
              <ResponsiveContainer
                width="100%"
                height={Math.max(
                  240,
                  Math.min(stats.categoryList.length, 8) * 46
                )}
              >
                <BarChart
                  data={stats.categoryList.slice(0, 8)}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 20,
                    bottom: 5,
                    left: 10,
                  }}
                >
                  <CartesianGrid
                    stroke={chartTheme.grid}
                    strokeDasharray="3 4"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    stroke={chartTheme.muted}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    stroke="#829994"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      value.length > 16
                        ? `${value.slice(0, 15)}…`
                        : value
                    }
                  />

                  <Tooltip contentStyle={TOOLTIP_STYLE} />

                  <Bar
                    dataKey="count"
                    name="Findings"
                    fill={chartTheme.accent}
                    radius={[0, 6, 6, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* Recent reviews */}
      <section className="content-panel ins-panel ins-recent">
        <div className="ins-panel-heading">
          <div>
            <h2>Recent review activity</h2>
            <p>Latest content submissions in this period</p>
          </div>

          <FileSearch size={20} />
        </div>

        {filteredReviews.length === 0 ? (
          <div className="ins-empty">
            No review activity in the selected period.
          </div>
        ) : (
          <div className="ins-recent-list">
            {filteredReviews.slice(0, 5).map((review) => (
              <div
                className="ins-recent-item"
                key={review.id}
              >
                <div>
                  <strong>
                    {review.title || 'Untitled review'}
                  </strong>

                  <small>
                    {new Date(
                      review.created_at
                    ).toLocaleString('en-IN')}
                  </small>
                </div>

                <span
                  className={`ins-status ins-status-${
                    review.status || 'unknown'
                  }`}
                >
                  {formatStatus(review.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="ins-disclaimer">
        Analytics are calculated from recorded content reviews
        and AI findings. Approval rate represents approved
        decisions divided by all completed decisions.
        These metrics do not guarantee brand compliance.
      </p>
    </div>
  )
}
