import {
  ShieldCheck, ArrowRight, ArrowUpRight, LockKeyhole,
  Sparkles, FileCheck2, Users, BookOpen, CheckCircle2
} from 'lucide-react'
import '../App.css'

function FeatureCard({ icon: Icon, number, title, description }) {
  return (
    <article className="landing-feature-card">
      <div className="feature-card-top">
        <span className="feature-card-icon"><Icon size={21} /></span>
        <span>{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

function WorkflowStep({ number, title, description }) {
  return (
    <article className="workflow-step">
      <span>{number}</span>
      <div className="workflow-step-line" />
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

export default function LandingPage({
  onGetStarted,
  onSignIn,
  onTerms,
  onPrivacy
}) {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <a className="landing-brand" href="#home">
          <span className="brand-icon"><ShieldCheck size={23} /></span>
          <span><strong>UNWIND</strong><small>BRANDGUARD</small></span>
        </a>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#principles">Our approach</a>
        </div>

        <div className="landing-nav-actions">
          <button className="landing-signin" onClick={onSignIn}>Sign in</button>
          <button className="primary-button" onClick={onGetStarted}>
            Get started <ArrowUpRight size={16} />
          </button>
        </div>
      </nav>

      <section className="landing-hero" id="home">
        <div className="landing-hero-copy">
          <div className="eyebrow"><span className="status-dot" /> BRAND GOVERNANCE, REIMAGINED</div>
          <h1>Your brand.<br /><span>Your standards.</span><br />Protected.</h1>
          <p>
            Keep every message consistent with the brand you've built.
            Review content against your approved guidelines before it reaches your audience.
          </p>
          <div className="landing-hero-actions">
            <button className="primary-button" onClick={onGetStarted}>
              Create your workspace <ArrowRight size={17} />
            </button>
            <a href="#how-it-works" className="text-link">See how it works <ArrowRight size={15} /></a>
          </div>
          <div className="landing-trust-line">
            <LockKeyhole size={15} />
            Human-controlled reviews. Your standards stay yours.
          </div>
        </div>

        <div className="landing-visual">
          <div className="visual-glow" />
          <div className="review-window">
            <div className="review-window-top">
              <div className="window-dots"><i /><i /><i /></div>
              <span>CONTENT REVIEW</span>
              <span className="review-window-status">ANALYSIS</span>
            </div>
            <div className="review-document">
              <div className="document-label">CAMPAIGN COPY · DRAFT 04</div>
              <h3>Make space for a healthier tomorrow.</h3>
              <p>
                Our platform helps people build healthier habits through
                thoughtful reflection and consistent support.
              </p>
              <div className="document-highlight">
                <span>REVIEW SUGGESTION</span>
                Consider using your approved phrase: “supportive wellbeing journey”.
              </div>
            </div>
            <div className="review-findings">
              <div className="finding-heading">
                <span><Sparkles size={15} /> REVIEW FINDINGS</span>
                <small>02 ITEMS</small>
              </div>
              <div className="finding-row">
                <span className="finding-dot warning" />
                <div><strong>Terminology consistency</strong><small>Approved terminology reference</small></div>
                <span className="finding-tag">REVIEW</span>
              </div>
              <div className="finding-row">
                <span className="finding-dot good" />
                <div><strong>Voice and tone</strong><small>Supportive tone guideline</small></div>
                <span className="finding-tag clear">CLEAR</span>
              </div>
            </div>
            <div className="review-window-footer">
              <span><LockKeyhole size={13} /> Human approval required</span>
              <span>BRANDGUARD <ShieldCheck size={14} /></span>
            </div>
          </div>
          <div className="floating-note">
            <CheckCircle2 size={17} />
            <span><strong>Purpose preserved</strong><small>Creator intent matters</small></span>
          </div>
        </div>
      </section>

      <section className="landing-principles" id="principles">
        <div>
          <span className="eyebrow">BUILT FOR CONSISTENCY</span>
          <h2>One brand. Every touchpoint.</h2>
        </div>
        <p>
          BrandGuard helps teams turn brand documentation into practical
          guidance for everyday content decisions.
        </p>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-heading">
          <span className="eyebrow">WHAT BRANDGUARD DOES</span>
          <h2>Clarity before content goes live.</h2>
          <p>Bring your standards, content and review decisions into one workflow.</p>
        </div>
        <div className="landing-feature-grid">
          <FeatureCard icon={BookOpen} number="01" title="Define your standards"
            description="Bring together your voice, tone, approved terminology, facts and content rules." />
          <FeatureCard icon={Sparkles} number="02" title="Review with context"
            description="Identify inconsistencies, unsupported claims and terminology that needs attention." />
          <FeatureCard icon={FileCheck2} number="03" title="Improve with evidence"
            description="Understand why something needs attention and see the relevant brand reference." />
          <FeatureCard icon={Users} number="04" title="Keep humans in control"
            description="Let authorised people review suggestions and make the final approval decision." />
        </div>
      </section>

      <section className="landing-workflow" id="how-it-works">
        <div className="landing-section-heading">
          <span className="eyebrow">A CLEARER WORKFLOW</span>
          <h2>From brand rules to confident publishing.</h2>
        </div>
        <div className="workflow-steps">
          <WorkflowStep number="01" title="Define" description="Add your approved brand guidelines and facts." />
          <WorkflowStep number="02" title="Submit" description="Bring in the content you want to review." />
          <WorkflowStep number="03" title="Improve" description="Understand findings and consider suggested changes." />
          <WorkflowStep number="04" title="Approve" description="A human reviewer makes the final decision." />
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-icon"><ShieldCheck size={30} /></div>
        <span className="eyebrow">YOUR BRAND, YOUR CONTROL</span>
        <h2>Make every piece of content feel like you.</h2>
        <p>Start building a more consistent and accountable content workflow.</p>
        <button className="primary-button" onClick={onGetStarted}>
          Get started with BrandGuard <ArrowRight size={17} />
        </button>
      </section>

      <footer className="landing-footer">
  <a className="landing-brand" href="#home">
    <span className="brand-icon"><ShieldCheck size={20} /></span>
    <span><strong>UNWIND</strong><small>BRANDGUARD</small></span>
  </a>

  <span>AI-assisted. Human-controlled.</span>

  <div className="landing-legal-links">
    <button onClick={onTerms}>Terms of Service</button>
    <button onClick={onPrivacy}>Privacy Policy</button>
  </div>

  <span>UNWIND BRANDGUARD · PROTOTYPE</span>
</footer>
    </main>
  )
}