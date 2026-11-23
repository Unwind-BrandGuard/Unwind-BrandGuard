
import { ShieldCheck, ArrowRight, X } from 'lucide-react'

export default function JudgeDemoPopup({ onYes, onNo }) {
  return (
    <div className="judge-overlay">
      <div
        className="judge-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="judge-popup-title"
      >
        <button
          className="judge-close"
          onClick={onNo}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="judge-icon">
          <ShieldCheck size={28} />
        </div>

        <span className="judge-eyebrow">
          CODE NOVA 2026
        </span>

        <h2 id="judge-popup-title">
          Are you a Code Nova judge?
        </h2>

        <p>
          We've prepared a special demo of Unwind BrandGuard
          so you can explore our features without registration.
        </p>

        <p className="judge-note">
          Demo access is available throughout the
  Code Nova judging period.
        </p>

        <div className="judge-actions">
          <button onClick={onNo} className="judge-cancel">
            No, continue normally
          </button>

          <button onClick={onYes} className="judge-continue">
            Yes, I'm a judge <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
