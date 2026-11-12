import { useEffect, useMemo, useState } from 'react';
import {
  ChartNoAxesCombined, Activity, ShieldCheck, AlertTriangle,
  CheckCircle2, Clock3, FileSearch, RefreshCw
} from 'lucide-react';
import { supabase } from '../supabase';
import './InsightsPage.css';

export default function InsightsPage({ workspace }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (workspace?.id) loadInsights();
  }, [workspace?.id]);

  async function loadInsights() {
    setLoading(true);
    setError('');

    const { data, error: queryError } = await supabase
      .from('content_reviews')
      .select('id, title, status, findings, created_at, reviewed_at')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setReviews([]);
    } else {
      setReviews(data || []);
    }

    setLoading(false);
  }

  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) =>
      ['pending', 'in_review'].includes(r.status)
    ).length;

    const approved = reviews.filter((r) => r.status === 'approved').length;
    const rejected = reviews.filter((r) => r.status === 'rejected').length;
    const changes = reviews.filter((r) =>
      r.status === 'changes_requested'
    ).length;

    const decisions = approved + rejected + changes;
    const approvalRate = decisions
      ? Math.round((approved / decisions) * 100)
      : 0;

    const findings = reviews.flatMap((r) =>
      Array.isArray(r.findings) ? r.findings : []
    );

    const categories = {};
    findings.forEach((finding) => {
      const category = finding.category || 'other';
      categories[category] = (categories[category] || 0) + 1;
    });

    const categoryList = Object.entries(categories)
      .sort((a, b) => b[1] - a[1]);

    const highSeverity = findings.filter(
      (f) => f.severity === 'high'
    ).length;

    return {
      total,
      pending,
      approved,
      rejected,
      changes,
      decisions,
      approvalRate,
      findingCount: findings.length,
      highSeverity,
      categoryList,
    };
  }, [reviews]);

  const maxCategoryCount = Math.max(
    1,
    ...stats.categoryList.map((item) => item[1])
  );

  if (loading) {
    return <div className="ins-loading">Loading governance insights...</div>;
  }

  return (
    <div className="ins-page">
      <div className="page-heading ins-heading">
        <div>
          <div className="eyebrow">GOVERNANCE INTELLIGENCE</div>
          <h1>Insights</h1>
          <p>Understand recurring brand inconsistencies and review outcomes.</p>
        </div>

        <button className="ins-refresh" onClick={loadInsights}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="ins-error">{error}</div>}

      <div className="ins-stats">
        <article className="ins-card">
          <span>Total reviews</span>
          <div><FileSearch size={19} /><strong>{stats.total}</strong></div>
          <small>Content submissions</small>
        </article>

        <article className="ins-card">
          <span>Pending reviews</span>
          <div><Clock3 size={19} /><strong>{stats.pending}</strong></div>
          <small>Awaiting final decisions</small>
        </article>

        <article className="ins-card">
          <span>Approval rate</span>
          <div><ShieldCheck size={19} /><strong>{stats.approvalRate}%</strong></div>
          <small>{stats.decisions} completed decisions</small>
        </article>

        <article className="ins-card">
          <span>Detected issues</span>
          <div><AlertTriangle size={19} /><strong>{stats.findingCount}</strong></div>
          <small>{stats.highSeverity} high-severity findings</small>
        </article>
      </div>

      <div className="ins-grid">
        <section className="content-panel ins-panel">
          <div className="ins-panel-heading">
            <div>
              <h2>Recurring brand violations</h2>
              <p>Most frequently detected issue categories</p>
            </div>
            <ChartNoAxesCombined size={20} />
          </div>

          {stats.categoryList.length === 0 ? (
            <div className="ins-empty">
              No findings recorded yet. Submit content for brand analysis.
            </div>
          ) : (
            <div className="ins-bars">
              {stats.categoryList.map(([category, count]) => (
                <div className="ins-bar-row" key={category}>
                  <div className="ins-bar-label">
                    <span>{category.replaceAll('_', ' ')}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="ins-bar-track">
                    <div
                      className="ins-bar-fill"
                      style={{
                        width: `${(count / maxCategoryCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="content-panel ins-panel">
          <div className="ins-panel-heading">
            <div>
              <h2>Review outcomes</h2>
              <p>Current workspace decision breakdown</p>
            </div>
            <Activity size={20} />
          </div>

          <div className="ins-outcomes">
            <div>
              <span><CheckCircle2 size={16} /> Approved</span>
              <strong>{stats.approved}</strong>
            </div>
            <div>
              <span><AlertTriangle size={16} /> Changes requested</span>
              <strong>{stats.changes}</strong>
            </div>
            <div>
              <span><Clock3 size={16} /> Pending / in review</span>
              <strong>{stats.pending}</strong>
            </div>
            <div>
              <span><ShieldCheck size={16} /> Rejected</span>
              <strong>{stats.rejected}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="content-panel ins-panel ins-recent">
        <div className="ins-panel-heading">
          <div>
            <h2>Recent review activity</h2>
            <p>Latest content submissions in this workspace</p>
          </div>
          <FileSearch size={20} />
        </div>

        {reviews.length === 0 ? (
          <div className="ins-empty">
            No review activity yet. Your workspace analytics will appear here.
          </div>
        ) : (
          <div className="ins-recent-list">
            {reviews.slice(0, 5).map((review) => (
              <div className="ins-recent-item" key={review.id}>
                <div>
                  <strong>{review.title}</strong>
                  <small>{new Date(review.created_at).toLocaleString()}</small>
                </div>
                <span className={`ins-status ins-status-${review.status}`}>
                  {review.status.replaceAll('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="ins-disclaimer">
        Insights are calculated from recorded content reviews and AI findings.
        They represent detected issues, not a guarantee of brand compliance.
      </p>
    </div>
  );
}