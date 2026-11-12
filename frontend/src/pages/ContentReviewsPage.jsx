
import { FileSearch, FileText, ArrowRight } from 'lucide-react'

export default function ContentReviewsPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CONTENT GOVERNANCE</div>
          <h1>Content Reviews</h1>
          <p>Submit content for review before it reaches your audience.</p>
        </div>
      </div>

      <section className="content-panel placeholder-panel">
        <div className="placeholder-icon"><FileSearch size={28} /></div>
        <h2>Review content against your brand standards</h2>
        <p>
          The content submission editor, guideline-based analysis,
          evidence-linked findings and human approval workflow are
          the next implementation milestone.
        </p>
        <div className="feature-list">
          <div><FileText size={16} /> Marketing copy, social posts and emails</div>
          <div><FileSearch size={16} /> Brand guideline checks</div>
          <div><ArrowRight size={16} /> Suggested corrections and review decisions</div>
        </div>
      </section>
    </>
  )
}
