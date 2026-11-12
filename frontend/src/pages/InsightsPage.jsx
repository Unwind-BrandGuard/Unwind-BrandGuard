
import { ChartNoAxesCombined, Activity, ShieldCheck } from 'lucide-react'

export default function InsightsPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">GOVERNANCE INTELLIGENCE</div>
          <h1>Insights</h1>
          <p>Understand recurring brand inconsistencies and review outcomes.</p>
        </div>
      </div>

      <section className="content-panel placeholder-panel">
        <div className="placeholder-icon">
          <ChartNoAxesCombined size={28} />
        </div>
        <h2>Make brand consistency measurable</h2>
        <p>
          Insights will use actual review data to show recurring violations,
          approval activity and governance trends.
        </p>
        <div className="feature-list">
          <div><Activity size={16} /> Common brand violations</div>
          <div><ChartNoAxesCombined size={16} /> Review trends</div>
          <div><ShieldCheck size={16} /> Content consistency</div>
        </div>
      </section>
    </>
  )
}
