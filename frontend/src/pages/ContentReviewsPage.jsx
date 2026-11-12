
import { useEffect, useState } from 'react';
import {
  FileSearch, Plus, Search, AlertTriangle, CheckCircle2,
  Clock3, ShieldCheck, XCircle, Eye, RefreshCw
} from 'lucide-react';
import { supabase } from '../supabase';
import { analyzeBrandContent } from '../services/brandAnalyzer';
import './ContentReviewsPage.css';

const initialForm = {
  title: '',
  content_type: 'social_post',
  original_content: '',
};

export default function ContentReviewsPage({ workspace, role }) {
  const [reviews, setReviews] = useState([]);
  const [guidelines, setGuidelines] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const canSubmit = ['owner', 'admin', 'editor'].includes(role);
  const canReview = ['owner', 'admin', 'editor', 'reviewer'].includes(role);

  useEffect(() => {
    if (workspace?.id) loadData();
  }, [workspace?.id]);

  async function loadData() {
    setLoading(true);
    setError('');

    const [guidelineResult, reviewResult] = await Promise.all([
      supabase
        .from('brand_guidelines')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('status', 'active'),
      supabase
        .from('content_reviews')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false }),
    ]);

    if (guidelineResult.error || reviewResult.error) {
      setError(
        guidelineResult.error?.message ||
        reviewResult.error?.message ||
        'Could not load review data.'
      );
    } else {
      setGuidelines(guidelineResult.data || []);
      setReviews(reviewResult.data || []);
    }

    setLoading(false);
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.original_content.trim()) return;

    if (guidelines.length === 0) {
      setError('Add at least one active brand guideline before submitting content.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error('Your session has expired. Please sign in again.');

      const analysis = analyzeBrandContent(form.original_content, guidelines);

      const { data, error: insertError } = await supabase
        .from('content_reviews')
        .insert({
          workspace_id: workspace.id,
          title: form.title.trim(),
          content_type: form.content_type,
          original_content: form.original_content.trim(),
          suggested_content: analysis.suggestedContent,
          findings: analysis.findings,
          summary: analysis.summary,
          status: 'pending',
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setReviews((current) => [data, ...current]);
      setSelected(data);
      setForm(initialForm);
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Unable to submit this review.');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(review, status) {
    if (!canReview) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError('Please sign in again.');
      return;
    }

    const updates = {
      status,
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    };

    const { data, error: updateError } = await supabase
      .from('content_reviews')
      .update(updates)
      .eq('id', review.id)
      .eq('workspace_id', workspace.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setReviews((current) =>
      current.map((item) => item.id === data.id ? data : item)
    );
    setSelected(data);
  }

  const filteredReviews = reviews.filter((review) =>
    `${review.title} ${review.content_type} ${review.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const count = (status) =>
    reviews.filter((review) => review.status === status).length;

  const severityClass = (severity) => `severity-${severity || 'low'}`;

  if (loading) {
    return <div className="cr-loading">Loading content reviews...</div>;
  }

  return (
    <div className="cr-page">
      <div className="cr-heading">
        <div>
          <span className="cr-eyebrow"><ShieldCheck size={14} /> BRAND GOVERNANCE</span>
          <h1>Content Reviews</h1>
          <p>Check content against your approved brand standards before publication.</p>
        </div>
        {canSubmit && (
          <button className="cr-primary" onClick={() => {
            setError('');
            setShowForm(!showForm);
            setSelected(null);
          }}>
            <Plus size={17} /> Submit content
          </button>
        )}
      </div>

      {error && <div className="cr-error"><AlertTriangle size={16} /> {error}</div>}

      <div className="cr-stats">
        <div><span>Total reviews</span><strong>{reviews.length}</strong></div>
        <div><span>Pending</span><strong>{count('pending') + count('in_review')}</strong></div>
        <div><span>Approved</span><strong>{count('approved')}</strong></div>
        <div><span>Changes requested</span><strong>{count('changes_requested')}</strong></div>
      </div>

      {showForm && (
        <form className="cr-panel cr-form" onSubmit={submitReview}>
          <div className="cr-panel-heading">
            <div>
              <h2>Submit content for review</h2>
              <p>Your content will be checked against active workspace guidelines.</p>
            </div>
            <button type="button" className="cr-icon-button" onClick={() => setShowForm(false)}>
              <XCircle size={19} />
            </button>
          </div>

          <label>Content title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. November product launch post"
            required
          />

          <label>Content type</label>
          <select
            value={form.content_type}
            onChange={(e) => setForm({ ...form, content_type: e.target.value })}
          >
            <option value="social_post">Social media post</option>
            <option value="marketing_copy">Marketing copy</option>
            <option value="email">Email</option>
            <option value="website">Website content</option>
            <option value="advertisement">Advertisement</option>
            <option value="other">Other</option>
          </select>

          <label>Content to review</label>
          <textarea
            value={form.original_content}
            onChange={(e) => setForm({ ...form, original_content: e.target.value })}
            placeholder="Paste your content here..."
            rows={8}
            required
          />

          <div className="cr-form-footer">
            <span>{guidelines.length} active guideline(s) will be checked</span>
            <button className="cr-primary" type="submit" disabled={saving}>
              <FileSearch size={16} />
              {saving ? 'Analysing and saving...' : 'Analyse content'}
            </button>
          </div>
        </form>
      )}

      <div className="cr-workspace">
        <section className="cr-panel cr-review-list">
          <div className="cr-panel-heading">
            <div>
              <h2>Review history</h2>
              <p>Submitted content and review status</p>
            </div>
            <button className="cr-icon-button" onClick={loadData} title="Refresh">
              <RefreshCw size={17} />
            </button>
          </div>

          <div className="cr-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..."
            />
          </div>

          {filteredReviews.length === 0 ? (
            <div className="cr-empty">
              <FileSearch size={30} />
              <strong>No reviews found</strong>
              <span>Submit content to start your brand review history.</span>
            </div>
          ) : (
            <div className="cr-list">
              {filteredReviews.map((review) => (
                <button
                  key={review.id}
                  className={`cr-review-item ${selected?.id === review.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelected(review);
                    setShowForm(false);
                  }}
                >
                  <div className="cr-review-item-top">
                    <strong>{review.title}</strong>
                    <span className={`cr-status status-${review.status}`}>
                      {review.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <span className="cr-review-meta">
                    {review.content_type.replaceAll('_', ' ')} ·{' '}
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  <span className="cr-review-meta">
                    {(review.findings || []).length} finding(s)
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="cr-panel cr-detail">
          {!selected ? (
            <div className="cr-empty cr-detail-empty">
              <Eye size={32} />
              <strong>Select a review</strong>
              <span>Choose a submission to inspect its findings and recommendations.</span>
            </div>
          ) : (
            <>
              <div className="cr-panel-heading">
                <div>
                  <span className="cr-eyebrow">REVIEW DETAILS</span>
                  <h2>{selected.title}</h2>
                  <p>{selected.content_type.replaceAll('_', ' ')} · {new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <span className={`cr-status status-${selected.status}`}>
                  {selected.status.replaceAll('_', ' ')}
                </span>
              </div>

              <div className="cr-summary">
                <AlertTriangle size={18} />
                <span>{selected.summary || 'No analysis summary available.'}</span>
              </div>

              <h3>Original content</h3>
              <div className="cr-content-box">{selected.original_content}</div>

              <h3>Suggested correction</h3>
              <div className="cr-content-box cr-suggestion">
                {selected.suggested_content || selected.original_content}
              </div>

              <div className="cr-findings-heading">
                <h3>Findings</h3>
                <span>{(selected.findings || []).length} detected</span>
              </div>

              {(selected.findings || []).length === 0 ? (
                <div className="cr-no-findings">
                  <CheckCircle2 size={19} />
                  No issues detected by the current checks. Human approval is still required.
                </div>
              ) : (
                <div className="cr-findings">
                  {selected.findings.map((finding) => (
                    <article className="cr-finding" key={finding.id}>
                      <div className="cr-finding-top">
                        <strong>{finding.category}</strong>
                        <span className={severityClass(finding.severity)}>
                          {finding.severity}
                        </span>
                      </div>
                      <p>{finding.message}</p>
                      <div className="cr-evidence">
                        <strong>Matched guideline: {finding.guideline}</strong>
                        <p>{finding.evidence}</p>
                      </div>
                      <div className="cr-recommendation">
                        <strong>Suggested action</strong>
                        <p>{finding.suggestion}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {canReview && !['approved', 'rejected'].includes(selected.status) && (
                <div className="cr-actions">
                  <button className="cr-secondary" onClick={() => updateStatus(selected, 'in_review')}>
                    <Eye size={15} /> Mark in review
                  </button>
                  <button className="cr-secondary" onClick={() => updateStatus(selected, 'changes_requested')}>
                    <AlertTriangle size={15} /> Request changes
                  </button>
                  <button className="cr-primary" onClick={() => updateStatus(selected, 'approved')}>
                    <CheckCircle2 size={15} /> Approve
                  </button>
                  <button className="cr-danger" onClick={() => updateStatus(selected, 'rejected')}>
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}

              {['approved', 'rejected'].includes(selected.status) && (
                <div className="cr-no-findings">
                  <CheckCircle2 size={18} />
                  This review has been {selected.status}. The decision is recorded.
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}