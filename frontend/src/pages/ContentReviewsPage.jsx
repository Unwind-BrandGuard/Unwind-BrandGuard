import { useEffect, useState } from 'react';
import {
  FileSearch, Plus, Search, AlertTriangle, CheckCircle2,
  ShieldCheck, XCircle, Eye, RefreshCw, UploadCloud,
  FileText, Image as ImageIcon, ExternalLink, MessageSquare, Send, Clock
} from 'lucide-react';
import { supabase } from '../supabase';
import './ContentReviewsPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const STORAGE_BUCKET = 'review-assets';

const initialForm = {
  title: '',
  content_type: 'social_post',
  original_content: '',
};

const allowedFileTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
];

export default function ContentReviewsPage({ workspace, role }) {
  const [reviews, setReviews] = useState([]);
  const [guidelines, setGuidelines] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selected, setSelected] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);

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

  async function loadComments(reviewId) {
    setCommentsLoading(true);

    const { data, error: commentsError } = await supabase
      .from('review_comments')
      .select('*')
      .eq('review_id', reviewId)
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: true });

    if (commentsError) {
      setError(commentsError.message || 'Could not load review comments.');
      setComments([]);
    } else {
      setComments(data || []);
    }

    setCommentsLoading(false);
  }

  async function submitComment(event) {
    event.preventDefault();

    if (!canReview || !selected || !commentText.trim()) return;

    setCommentSaving(true);
    setError('');

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      if (!userData.user) {
        throw new Error('Please sign in again.');
      }

      const metadata = userData.user.user_metadata || {};

      const authorName =
        metadata.full_name ||
        metadata.fullName ||
        metadata.name ||
        userData.user.email?.split('@')[0] ||
        'Workspace member';

      const { data, error: insertError } = await supabase
        .from('review_comments')
        .insert({
          review_id: selected.id,
          workspace_id: workspace.id,
          created_by: userData.user.id,
          author_name: authorName,
          comment_text: commentText.trim(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setComments((current) => [...current, data]);
      setCommentText('');
    } catch (err) {
      setError(err.message || 'Could not add comment.');
    } finally {
      setCommentSaving(false);
    }
  }

  async function openReview(review) {
    setError('');
    setComments([]);
    setCommentText('');
    loadComments(review.id);

    setSelected({
      ...review,
      asset_url: null,
      asset_url_error: false,
    });

    if (!review.asset_path) return;

    const { data, error: urlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(review.asset_path, 60 * 60);

    if (urlError || !data?.signedUrl) {
      setSelected((current) =>
        current?.id === review.id
          ? { ...current, asset_url_error: true }
          : current
      );
      return;
    }

    setSelected((current) =>
      current?.id === review.id
        ? { ...current, asset_url: data.signedUrl }
        : current
    );
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      setError('Only PNG, JPG, JPEG, WEBP and PDF files are supported.');
      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('The uploaded file must not exceed 10 MB.');
      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  }

  async function submitReview(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Please enter a content title.');
      return;
    }

    if (!form.original_content.trim() && !selectedFile) {
      setError('Please enter content or upload an image/PDF.');
      return;
    }

    if (guidelines.length === 0) {
      setError('Add at least one active brand guideline before submitting content.');
      return;
    }

    setSaving(true);
    setError('');

    let uploadedAssetPath = null;

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      if (!userData.user) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const requestBody = new FormData();

      requestBody.append('title', form.title.trim());
      requestBody.append('content_type', form.content_type);
      requestBody.append('content', form.original_content.trim());
      requestBody.append('workspace_id', workspace.id);

      if (selectedFile) {
        requestBody.append('file', selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: requestBody,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'AI analysis failed.');
      }

      const analysis = result.analysis;
      const asset = result.asset || null;

      uploadedAssetPath = asset?.path || null;

      const { data, error: insertError } = await supabase
        .from('content_reviews')
        .insert({
          workspace_id: workspace.id,
          title: form.title.trim(),
          content_type: form.content_type,
          original_content: form.original_content.trim(),
          suggested_content: analysis.suggestedContent || '',
          findings: analysis.findings || [],
          summary: analysis.summary || '',
          status: 'pending',
          created_by: userData.user.id,
          asset_path: asset?.path || null,
          asset_name: asset?.name || null,
          asset_mime_type: asset?.mime_type || null,
          asset_size: asset?.size || null,
        })
        .select()
        .single();

      if (insertError) {
        // Remove the uploaded file if saving its review failed.
        if (uploadedAssetPath) {
          const { error: cleanupError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([uploadedAssetPath]);

          if (cleanupError) {
            console.error('Asset cleanup failed:', cleanupError.message);
          }
        }

        throw insertError;
      }

      setReviews((current) => [data, ...current]);
      setForm(initialForm);
      setSelectedFile(null);
      setShowForm(false);

      await openReview(data);
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

    await openReview(data);
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
          <span className="cr-eyebrow">
            <ShieldCheck size={14} /> BRAND GOVERNANCE
          </span>
          <h1>Content Reviews</h1>
          <p>Check content against your approved brand standards before publication.</p>
        </div>

        {canSubmit && (
          <button
            className="cr-primary"
            onClick={() => {
              setError('');
              setShowForm(!showForm);
              setSelected(null);
            }}
          >
            <Plus size={17} /> Submit content
          </button>
        )}
      </div>

      {error && (
        <div className="cr-error">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

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
              <p>Submit text, an image, a PDF, or combine text with an asset.</p>
            </div>

            <button
              type="button"
              className="cr-icon-button"
              onClick={() => {
                setShowForm(false);
                setSelectedFile(null);
                setError('');
              }}
            >
              <XCircle size={19} />
            </button>
          </div>

          <label>Content title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. November product launch campaign"
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

          <label>Text content <span className="cr-optional">(optional if uploading an asset)</span></label>
          <textarea
            value={form.original_content}
            onChange={(e) => setForm({ ...form, original_content: e.target.value })}
            placeholder="Paste your content here..."
            rows={8}
          />

          <label>Upload image or PDF</label>
          <div className="cr-upload-box">
            <input
              id="cr-file-upload"
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleFileChange}
            />

            <label htmlFor="cr-file-upload" className="cr-upload-label">
              <UploadCloud size={22} />
              <strong>{selectedFile ? 'Change selected file' : 'Choose an image or PDF'}</strong>
              <span>PNG, JPG, WEBP or PDF · Maximum 10 MB</span>
            </label>

            {selectedFile && (
              <div className="cr-selected-file">
                {selectedFile.type === 'application/pdf'
                  ? <FileText size={18} />
                  : <ImageIcon size={18} />}

                <span>{selectedFile.name}</span>
                <button
                  type="button"
                  className="cr-remove-file"
                  onClick={() => {
                    setSelectedFile(null);
                    const input = document.getElementById('cr-file-upload');
                    if (input) input.value = '';
                  }}
                >
                  <XCircle size={17} />
                </button>
              </div>
            )}
          </div>

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
                    setShowForm(false);
                    openReview(review);
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
                    {review.asset_path ? ' · Asset attached' : ''}
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
                  <p>
                    {selected.content_type.replaceAll('_', ' ')} ·{' '}
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>

                <span className={`cr-status status-${selected.status}`}>
                  {selected.status.replaceAll('_', ' ')}
                </span>
              </div>

              <div className="cr-summary">
                <AlertTriangle size={18} />
                <span>{selected.summary || 'No analysis summary available.'}</span>
              </div>

              {selected.asset_path && (
                <>
                  <h3>Uploaded asset</h3>

                  <div className="cr-asset-box">
                    <div className="cr-asset-meta">
                      {selected.asset_mime_type === 'application/pdf'
                        ? <FileText size={19} />
                        : <ImageIcon size={19} />}

                      <div>
                        <strong>{selected.asset_name || 'Uploaded asset'}</strong>
                        <span>
                          {selected.asset_mime_type || 'File'} ·{' '}
                          {selected.asset_size
                            ? `${(selected.asset_size / (1024 * 1024)).toFixed(2)} MB`
                            : ''}
                        </span>
                      </div>
                    </div>

                    {selected.asset_url_error && (
                      <p className="cr-asset-error">
                        Could not load this asset. Check storage permissions.
                      </p>
                    )}

                    {selected.asset_url && (
                      <>
                        {selected.asset_mime_type?.startsWith('image/') && (
                          <img
                            className="cr-asset-image"
                            src={selected.asset_url}
                            alt={selected.asset_name || 'Uploaded review asset'}
                          />
                        )}

                        {selected.asset_mime_type === 'application/pdf' && (
                          <iframe
                            className="cr-asset-pdf"
                            src={selected.asset_url}
                            title={selected.asset_name || 'Uploaded PDF'}
                          />
                        )}

                        <a
                          className="cr-asset-open"
                          href={selected.asset_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open original file <ExternalLink size={14} />
                        </a>
                      </>
                    )}

                    {!selected.asset_url && !selected.asset_url_error && (
                      <span className="cr-asset-loading">Loading secure preview...</span>
                    )}
                  </div>
                </>
              )}

              <h3>Original content</h3>
              <div className="cr-content-box">
                {selected.original_content || 'No separate text content was submitted.'}
              </div>

              {selected.original_content && (
                <>
                  <h3>Suggested correction</h3>
                  <div className="cr-content-box cr-suggestion">
                    {selected.suggested_content || selected.original_content}
                  </div>
                </>
              )}

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
                        <strong>{finding.category?.replaceAll('_', ' ')}</strong>
                        <span className={severityClass(finding.severity)}>
                          {finding.severity}
                        </span>
                      </div>

                      {finding.sourceType && (
                        <span className="cr-finding-source">
                          {finding.sourceType === 'visual'
                            ? 'Visual finding'
                            : finding.sourceType === 'document'
                              ? 'PDF/document finding'
                              : 'Text finding'}
                        </span>
                      )}

                      <p>{finding.message}</p>

                      {(finding.matchedText || finding.visualDescription) && (
                        <div className="cr-observed">
                          <strong>
                            {finding.sourceType === 'visual' ||
                            finding.sourceType === 'document'
                              ? 'Observed visual evidence'
                              : 'Matched content'}
                          </strong>

                          <p>
                            {finding.matchedText || finding.visualDescription}
                          </p>

                          {finding.location && (
                            <span className="cr-location">
                              Location: {finding.location}
                            </span>
                          )}
                        </div>
                      )}

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

              <section className="cr-comments">
                <div className="cr-comments-heading">
                  <div>
                    <h3>
                      <MessageSquare size={16} />
                      Reviewer Discussion
                    </h3>
                    <span>{comments.length} comment(s)</span>
                  </div>
                  <button
                    type="button"
                    className="cr-icon-button"
                    onClick={() => loadComments(selected.id)}
                    title="Refresh discussion"
                    disabled={commentsLoading}
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>

                {commentsLoading ? (
                  <p className="cr-comments-empty">Loading discussion...</p>
                ) : comments.length === 0 ? (
                  <p className="cr-comments-empty">
                    No comments yet. Start the review discussion.
                  </p>
                ) : (
                  <div className="cr-comment-list">
                    {comments.map((comment) => (
                      <article className="cr-comment" key={comment.id}>
                        <div className="cr-comment-meta">
                          <strong>
                            {comment.author_name || (comment.created_by
                              ? `User · ${comment.created_by.slice(0, 8)}…`
                              : 'Former member')}
                          </strong>
                          <span>
                            <Clock size={12} />
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p>{comment.comment_text}</p>
                      </article>
                    ))}
                  </div>
                )}

                {canReview ? (
                  <form className="cr-comment-form" onSubmit={submitComment}>
                    <textarea
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      placeholder="Share feedback or discuss this review..."
                      rows={3}
                      maxLength={3000}
                      aria-label="Write a review comment"
                    />
                    <div className="cr-comment-form-footer">
                      <span>{commentText.length}/3000</span>
                      <button
                        className="cr-primary"
                        type="submit"
                        disabled={commentSaving || !commentText.trim()}
                      >
                        <Send size={15} />
                        {commentSaving ? 'Posting...' : 'Post comment'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="cr-comments-readonly">
                    You have view-only access to this discussion.
                  </p>
                )}
              </section>

              {canReview && !['approved', 'rejected'].includes(selected.status) && (
                <div className="cr-actions">
                  <button
                    className="cr-secondary"
                    onClick={() => updateStatus(selected, 'in_review')}
                  >
                    <Eye size={15} /> Mark in review
                  </button>

                  <button
                    className="cr-secondary"
                    onClick={() => updateStatus(selected, 'changes_requested')}
                  >
                    <AlertTriangle size={15} /> Request changes
                  </button>

                  <button
                    className="cr-primary"
                    onClick={() => updateStatus(selected, 'approved')}
                  >
                    <CheckCircle2 size={15} /> Approve
                  </button>

                  <button
                    className="cr-danger"
                    onClick={() => updateStatus(selected, 'rejected')}
                  >
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