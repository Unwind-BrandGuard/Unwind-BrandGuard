
import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
  X,
  ShieldCheck,
} from 'lucide-react';

const FINDINGS = [
  {
    id: "claim",
    title: "Unsupported claim",
    severity: "High",
    category: "Accuracy",
    original: "Our platform guarantees lasting results in 30 days.",
    suggestion: "Our platform helps people build consistent habits.",
    guideline:
      "Avoid guaranteed outcomes unless supported by approved evidence.",
    explanation:
      "The original statement promises a specific outcome without supporting evidence.",
  },
  {
    id: "tone",
    title: "Off-brand tone",
    severity: "Medium",
    category: "Brand voice",
    original: "ACT NOW! Don't miss out!!",
    suggestion: "Explore the experience when you're ready.",
    guideline:
      "Use calm, supportive language. Avoid pressure and urgency tactics.",
    explanation:
      "The wording creates unnecessary urgency and conflicts with the approved tone.",
  },
  {
    id: "terminology",
    title: "Terminology mismatch",
    severity: "Low",
    category: "Terminology",
    original: "Join our wellness program.",
    suggestion: "Begin your wellbeing journey.",
    guideline:
      'Use "wellbeing journey" consistently in customer-facing content.',
    explanation:
      "The draft uses terminology different from the approved brand language.",
  },
];

export default function BrandReviewDemo() {
  const [active, setActive] = useState("claim");
  const [decisions, setDecisions] = useState({});

  const finding = FINDINGS.find((item) => item.id === active);
  const reviewed = Object.keys(decisions).length;

  const decide = (decision) => {
    setDecisions((previous) => ({
      ...previous,
      [active]: decision,
    }));
  };

  return (
    <div className="bg-review">
      <div className="bg-review-topbar">
        <div className="bg-review-topbar-title">
          <div className="bg-review-app-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <strong>Content Review</strong>
            <span>Campaign draft · Sample workspace</span>
          </div>
        </div>

        <span className="bg-review-ai-badge">
          <Sparkles size={14} />
          AI-assisted
        </span>
      </div>

      <div className="bg-review-progress">
        <div className="bg-review-progress-copy">
          <span>Review progress</span>
          <strong>{reviewed} of {FINDINGS.length} reviewed</strong>
        </div>
        <div className="bg-review-progress-track">
          <div
            className="bg-review-progress-fill"
            style={{ width: `${(reviewed / FINDINGS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-review-layout">
        <aside className="bg-review-sidebar">
          <div className="bg-review-sidebar-heading">
            <FileText size={16} />
            <span>Detected findings</span>
            <span className="bg-review-count">{FINDINGS.length}</span>
          </div>

          <div className="bg-review-finding-list">
            {FINDINGS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`bg-review-finding ${
                  active === item.id ? "is-active" : ""
                }`}
                onClick={() => setActive(item.id)}
                aria-pressed={active === item.id}
              >
                <span className="bg-review-finding-title">
                  {decisions[item.id] ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  {item.title}
                </span>

                <span className="bg-review-finding-meta">
                  <span className={`bg-review-severity is-${item.severity.toLowerCase()}`}>
                    {item.severity}
                  </span>
                  <span>{item.category}</span>
                </span>
              </button>
            ))}
          </div>

          <p className="bg-review-sidebar-note">
            Select a finding to inspect its supporting guideline.
          </p>
        </aside>

        <div className="bg-review-main">
          <div className="bg-review-main-heading">
            <div>
              <span className="bg-review-overline">FINDING DETAILS</span>
              <h3>{finding.title}</h3>
            </div>
            <span className={`bg-review-severity is-${finding.severity.toLowerCase()}`}>
              {finding.severity} priority
            </span>
          </div>

          <div className="bg-review-content-block">
            <span className="bg-review-label">FLAGGED CONTENT</span>
            <div className="bg-review-original">
              <AlertTriangle size={17} />
              <p>{finding.original}</p>
            </div>
          </div>

          <div className="bg-review-content-block">
            <span className="bg-review-label">
              <ShieldCheck size={14} />
              RELEVANT BRAND GUIDELINE
            </span>
            <p className="bg-review-guideline">{finding.guideline}</p>
          </div>

          <div className="bg-review-content-block">
            <span className="bg-review-label">
              <Sparkles size={14} />
              AI-SUGGESTED REVISION
            </span>
            <div className="bg-review-suggestion">
              <CheckCircle2 size={18} />
              <p>{finding.suggestion}</p>
            </div>
            <p className="bg-review-explanation">
              {finding.explanation}
            </p>
          </div>

          {decisions[active] && (
            <div className="bg-review-decision" role="status">
              <CheckCircle2 size={17} />
              Decision recorded:{" "}
              <strong>
                {decisions[active] === "approved"
                  ? "Approved with edit"
                  : "Rejected"}
              </strong>
            </div>
          )}

          <div className="bg-review-actions">
            <button
              type="button"
              className="bg-review-approve"
              onClick={() => decide("approved")}
            >
              <Check size={17} />
              Approve suggestion
            </button>

            <button
              type="button"
              className="bg-review-reject"
              onClick={() => decide("rejected")}
            >
              <X size={17} />
              Reject
            </button>

            <button
              type="button"
              className="bg-review-reset"
              onClick={() => {
                setDecisions({});
                setActive("claim");
              }}
              aria-label="Reset demo"
              title="Reset demo"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-review-footer">
        <ShieldCheck size={15} />
        <span>Illustrative demo · No real AI analysis or saved decisions</span>
      </div>
    </div>
  );
}
