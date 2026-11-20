import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Menu, X,
  ShieldCheck,
} from 'lucide-react'
import '../App.css' 
import InteractiveBrandCore from "../components/landing/InteractiveBrandCore";// keeps theme variables; landing styles below are fully namespaced
import './LandingPage.css'
import BrandReviewDemo from "../components/landing/BrandReviewDemo";


const NAV = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'principles', label: 'Our approach' }
]

const DRIFT = [
  {
    key: 'terminology',
    tab: 'Inconsistent terminology',
    approved: 'A supportive wellbeing journey.',
    drifted: 'A wellness program.',
    note: 'Three teams, three names for one idea. Each is reasonable alone; together they blur the brand.'
  },
  {
    key: 'claims',
    tab: 'Unsupported claims',
    approved: 'Helps people build consistent habits.',
    drifted: 'Guarantees lasting results in 30 days.',
    note: 'A promise no approved source supports, and one that is hard to take back once published.'
  },
  {
    key: 'tone',
    tab: 'Off-brand tone',
    approved: "Here when you're ready.",
drifted: "ACT NOW. Don't miss out!!",
    note: 'Urgency tactics contradict a calm, supportive voice, even when the facts are right.'
  },
  {
    key: 'approvals',
    tab: 'Unclear approvals',
    approved: 'Approved by Brand Lead · v4',
    drifted: 'final_v7_REALLY-final.pdf. Who signed off?',
    note: 'When nobody can say who decided, nobody is accountable for what went out.'
  }
]

const STEPS = [
  { n: '01', title: 'Define', text: 'Bring your brand guidelines and approved language together.' },
  { n: '02', title: 'Submit', text: 'Add content for review, including supported text and document formats.' },
  { n: '03', title: 'Refine', text: 'Explore findings, supporting references, and suggested changes.' },
  { n: '04', title: 'Decide', text: 'Your team makes the final approval decision.' }
]

/* Adds data-in once the element enters the viewport (CSS handles the motion). */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || shown) return undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])
  return (
    <Tag
      ref={ref}
      className={`bg-landing-reveal ${className}`}
      data-in={shown}
      style={{ '--bg-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

function MagneticButton({ children, className = '', style, ...props }) {
  const buttonRef = useRef(null)
  const frameRef = useRef(null)

  const handleMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (e.pointerType !== 'mouse') return

    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)

    frameRef.current = requestAnimationFrame(() => {
      button.style.setProperty('--mag-x', `${x * 0.13}px`)
      button.style.setProperty('--mag-y', `${y * 0.18}px`)
      button.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
      button.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
      frameRef.current = null
    })
  }

  const reset = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    const button = buttonRef.current
    if (!button) return

    button.style.setProperty('--mag-x', '0px')
    button.style.setProperty('--mag-y', '0px')
  }

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <button
      {...props}
      ref={buttonRef}
      className={`bg-magnetic-btn ${className}`}
      style={style}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </button>
  )
}

function TiltCard({ children, className = "", ...props }) {
  const cardRef = useRef(null);
  const frameRef = useRef(null);

  const handleMove = (event) => {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 8;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      card.style.setProperty("--tilt-x", `${rotateX}deg`);
      card.style.setProperty("--tilt-y", `${rotateY}deg`);
      card.style.setProperty("--glow-x", `${x * 100}%`);
      card.style.setProperty("--glow-y", `${y * 100}%`);
      frameRef.current = null;
    });
  };

  const reset = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <article
      {...props}
      ref={cardRef}
      className={`bg-tilt-card ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
    </article>
  );
}

function Logo({ onClick }) {
  return (
    <a className="bg-landing-logo" href="#home" onClick={onClick}>
      <img src="/brandguard-logo.png" alt="" width="34" height="34" />
      <span>
        <strong>Unwind</strong>
        <small>BrandGuard</small>
      </span>
      <span className="bg-landing-sr">Unwind BrandGuard home</span>
    </a>
  )
}

function DriftVisual() {
  const [active, setActive] = useState(0)
  const [drift, setDrift] = useState(55)
  const item = DRIFT[active]
  return (
    <div className="bg-landing-drift" style={{ '--bg-drift': drift / 100 }}>
      <div className="bg-landing-drift-tabs" role="tablist" aria-label="Examples of brand drift">
        {DRIFT.map((d, i) => (
          <button
            key={d.key}
            role="tab"
            id={`bg-drift-tab-${d.key}`}
            aria-selected={i === active}
            aria-controls="bg-drift-panel"
            tabIndex={i === active ? 0 : -1}
            className={i === active ? 'is-active' : ''}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') setActive((active + 1) % DRIFT.length)
              if (e.key === 'ArrowLeft') setActive((active + DRIFT.length - 1) % DRIFT.length)
            }}
          >
            {d.tab}
          </button>
        ))}
      </div>
      <div id="bg-drift-panel" role="tabpanel" aria-labelledby={`bg-drift-tab-${item.key}`} className="bg-landing-drift-stage">
        <div className="bg-landing-drift-card is-standard">
          <span>Approved standard</span>
          <p>{item.approved}</p>
        </div>
        <div className="bg-landing-drift-card is-drifted" aria-live="polite">
          <span>What gets published</span>
          <p>{item.drifted}</p>
        </div>
      </div>
      <p className="bg-landing-drift-note">{item.note}</p>
      <label className="bg-landing-drift-slider">
        <span>Time without review</span>
        <input
          type="range"
          min="0"
          max="100"
          value={drift}
          onChange={(e) => setDrift(Number(e.target.value))}
          aria-label="Time without review: moves the published content away from the approved standard"
        />
      </label>
      <p className="bg-landing-demo-tag">Illustrative example</p>
    </div>
  )
}

export default function LandingPage({ onGetStarted, onSignIn, onAbout, onTerms, onPrivacy }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef(null)

const [workflowProgress, setWorkflowProgress] = useState(0)

useEffect(() => {
  const section = document.getElementById("how-it-works")
  if (!section) return

  let frame = null

  const updateProgress = () => {
    if (frame !== null) return

    frame = requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect()
      const distance = rect.height + window.innerHeight * 0.6
      const progress = Math.max(
        0,
        Math.min(1, (window.innerHeight * 0.75 - rect.top) / distance)
      )

      setWorkflowProgress(progress)
      frame = null
    })
  }

  updateProgress()
  window.addEventListener("scroll", updateProgress, { passive: true })
  window.addEventListener("resize", updateProgress)

  return () => {
    window.removeEventListener("scroll", updateProgress)
    window.removeEventListener("resize", updateProgress)
    if (frame !== null) cancelAnimationFrame(frame)
  }
}, [])


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const goTo = useCallback((e, id) => {
    const target = document.getElementById(id)
    if (!target) return
    e.preventDefault()
    setMenuOpen(false)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }, [])

  const act = (fn) => () => {
    setMenuOpen(false)
    fn?.()
  }

  return (
    <div className="bg-landing" ref={rootRef}>
      <a className="bg-landing-skip" href="#main" onClick={(e) => goTo(e, 'main')}>Skip to content</a>

      <header className={`bg-landing-nav ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-open' : ''}`}>
        <div className="bg-landing-nav-inner">
          <Logo onClick={(e) => goTo(e, 'home')} />
          <nav className="bg-landing-links" aria-label="Primary">
            {NAV.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={(e) => goTo(e, l.id)}>{l.label}</a>
            ))}
            <button type="button" onClick={act(onAbout)}>About us</button>
          </nav>
          <div className="bg-landing-nav-actions">
            <button type="button" className="bg-landing-btn-text" onClick={act(onSignIn)}>Sign in</button>
            <MagneticButton
  type="button"
  className="bg-landing-btn bg-landing-btn--small"
  onClick={act(onGetStarted)}
>
  Get started <ArrowUpRight size={15} aria-hidden="true" />
</MagneticButton>
          </div>
          <button
            type="button"
            className="bg-landing-burger"
            aria-expanded={menuOpen}
            aria-controls="bg-landing-mobile"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div id="bg-landing-mobile" className="bg-landing-mobile" hidden={!menuOpen}>
          {NAV.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={(e) => goTo(e, l.id)}>{l.label}</a>
          ))}
          <button type="button" onClick={act(onAbout)}>About us</button>
          <button type="button" onClick={act(onSignIn)}>Sign in</button>
          <button type="button" className="bg-landing-btn" onClick={act(onGetStarted)}>
            Get started <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main id="main">
        {/* A — Hero */}
        <section className="bg-landing-hero" id="home" aria-labelledby="bg-hero-title">
          <div className="bg-landing-hero-copy">
            <p className="bg-landing-eyebrow bg-landing-intro" style={{ '--i': 0 }}>Introducing Unwind BrandGuard</p>
            <h1
              id="bg-hero-title"
              className="bg-landing-display bg-landing-cinematic-title"
              aria-label="Every word shapes your brand. Make every word count."
            >
              <span className="bg-landing-title-line" aria-hidden="true">
                {['Every', 'word', 'shapes', 'your', 'brand.'].map((word, index) => (
                  <span className="bg-landing-title-word" key={word} style={{ '--word-index': index }}>
                    {word}
                  </span>
                ))}
              </span>
              <span className="bg-landing-title-line" aria-hidden="true">
                {['Make', 'every', 'word'].map((word, index) => (
                  <span className="bg-landing-title-word" key={word} style={{ '--word-index': index + 5 }}>
                    {word}
                  </span>
                ))}
                <em className="bg-landing-title-word" style={{ '--word-index': 8 }}>count.</em>
              </span>
            </h1>
            <p className="bg-landing-lede bg-landing-intro" style={{ '--i': 2 }}>
              Your brand is more than a logo. It's every claim, every campaign, and every message you put into the
              world. BrandGuard brings your guidelines, AI-assisted reviews, and human decisions together—so your
              content stays unmistakably yours.
            </p>
            <div className="bg-landing-actions bg-landing-intro" style={{ '--i': 3 }}>
              
<MagneticButton
  type="button"
  className="bg-landing-btn"
  onClick={onGetStarted}
>
  <span>Start protecting your brand</span>
  <ArrowRight size={17} aria-hidden="true" />
</MagneticButton>

              <a className="bg-landing-btn bg-landing-btn--ghost" href="#how-it-works" onClick={(e) => goTo(e, 'how-it-works')}>
                Explore how it works
              </a>
            </div>
            <p className="bg-landing-trust bg-landing-intro" style={{ '--i': 4 }}>
              <ShieldCheck size={15} aria-hidden="true" /> AI-assisted analysis. Human-controlled decisions.
            </p>
          </div>
          <div className="bg-landing-hero-visual bg-landing-hero-visual--cinematic">
            <InteractiveBrandCore />
          </div>
          <a className="bg-landing-scroll" href="#problem" onClick={(e) => goTo(e, 'problem')} aria-label="Scroll to the next section">
            <span>Scroll</span><i aria-hidden="true" />
          </a>
        </section>

        {/* B — The problem */}
        <section className="bg-landing-section bg-landing-problem" id="problem" aria-labelledby="bg-problem-title">
          <Reveal className="bg-landing-problem-copy">
            <p className="bg-landing-eyebrow">The challenge</p>
            <h2 id="bg-problem-title" className="bg-landing-display">
              A brand isn't lost overnight.<br />It fades one inconsistency at a time.
            </h2>
            <p className="bg-landing-lede">
              A new campaign borrows a different phrase. A document makes a claim nobody checked. A colleague writes
              in their own voice. None of it feels like a crisis, until your audience can no longer tell what you stand for.
            </p>
          </Reveal>
          <Reveal delay={120}><DriftVisual /></Reveal>
        </section>

        {/* C — The solution */}
        <section className="bg-landing-section bg-landing-solution" id="solution" aria-labelledby="bg-solution-title">
          <Reveal className="bg-landing-head">
            <p className="bg-landing-eyebrow">Meet your brand's second set of eyes</p>
            <h2 id="bg-solution-title" className="bg-landing-display">Intelligence that understands your standards.</h2>
            <p className="bg-landing-lede">
              BrandGuard uses the guidelines your organization defines to assist with content reviews. Try the sample
              below: choose a finding to see the guideline behind it.
            </p>
          </Reveal>
          <Reveal delay={120} className="bg-review-demo-container">
  <BrandReviewDemo />
</Reveal>
        </section>

       {/* D — Capabilities */}
{/* Features — BrandGuard capabilities */}
<section
  className="bg-landing-section bg-features-section"
  id="features"
  aria-labelledby="bg-features-title"
>
  <div className="bg-features-heading">
    <p className="bg-landing-eyebrow">
      ONE CONNECTED WORKFLOW
    </p>

    <h2
      id="bg-features-title"
      className="bg-landing-display"
    >
      Everything your brand
      <br />
      needs to stay itself.
    </h2>

    <p className="bg-features-intro">
      From defining your brand identity to reviewing content
      and approving decisions, everything works together
      in one connected space.
    </p>
  </div>

  <div className="bg-features-grid">
    {[
      {
        number: "01",
        title: "Define your brand.",
        description:
          "Keep your brand guidelines, voice, terminology, and visual identity in one place.",
        image: "/illustrations/brand-guidelines.svg",
      },
      {
        number: "02",
        title: "Review with intelligence.",
        description:
          "Analyze content against your brand guidelines and identify inconsistencies before publishing.",
        image: "/illustrations/content-review.svg",
      },
      {
        number: "03",
        title: "Keep humans in control.",
        description:
          "Review AI findings, make informed decisions, and approve content with confidence.",
        image: "/illustrations/human-approval.svg",
      },
      {
        number: "04",
        title: "See the bigger picture.",
        description:
          "Understand recurring issues, review outcomes, and how consistently your brand is represented.",
        image: "/illustrations/governance-insights.svg",
      },
    ]
.map((feature) => (
  <Reveal
  key={feature.number}
  delay={Number(feature.number) * 110}
  className="bg-feature-reveal"
>
  <TiltCard className="bg-feature-card">
    <div className="bg-feature-illustration">
      <img
        src={feature.image}
        alt={feature.title}
        loading="lazy"
      />
    </div>

    <div className="bg-feature-content">
      <span className="bg-feature-number">
        {feature.number} / 04
      </span>

      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </div>
    </TiltCard>
</Reveal>
))}

  </div>
</section>

        {/* E — How it works */}
        <section className="bg-landing-section bg-landing-how" id="how-it-works" aria-labelledby="bg-how-title">

<div
  className="bg-workflow-progress-line"
  aria-hidden="true"
  style={{ "--workflow-progress": workflowProgress }}
/>

          <Reveal className="bg-landing-head">
            <p className="bg-landing-eyebrow">From guidelines to confidence</p>
            <h2 id="bg-how-title" className="bg-landing-display">Four steps. One consistent brand.</h2>
          </Reveal>
          <ol className="bg-landing-steps">
            {STEPS.map((s, i) => (
             
<Reveal
  as="li"
  key={s.n}
  delay={i * 110}
  className={`bg-landing-step bg-workflow-step ${
    workflowProgress >= (i + 0.5) / 4 ? "is-active" : ""
  }`}
>

                <span className="bg-landing-step-n" aria-hidden="true">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* F — Human in the loop */}
        <section className="bg-landing-section bg-landing-human" id="principles" aria-labelledby="bg-human-title">
          <Reveal className="bg-landing-human-copy">
            <h2 id="bg-human-title" className="bg-landing-display">
              AI can recommend.<br />People remain responsible.
            </h2>
            <p className="bg-landing-lede">
              BrandGuard helps surface potential issues and explain them in context. It doesn't replace your team's
              judgment. Every final content decision belongs to the people responsible for your brand.
            </p>
          </Reveal>
          <Reveal delay={120} className="bg-landing-layers" aria-label="AI analysis sits beneath human judgment">
            <div className="bg-landing-layer is-ai">
              <span>Layer one · AI analysis</span>
              <p>Flags "guarantees lasting results" as unsupported by the approved facts.</p>
              <p>Suggests: "helps build consistent habits."</p>
            </div>
            <div className="bg-landing-layer is-human">
              <span>Layer two · Human judgment</span>
              <p>Reviewer reads the finding, the reference, and the suggestion.</p>
              <p className="bg-landing-layer-decision">Decision: <strong>Approve with edit</strong></p>
            </div>
            <p className="bg-landing-demo-tag">Illustrative example</p>
          </Reveal>
        </section>

        {/* G — Insights */}
        <section className="bg-landing-section" id="insights" aria-labelledby="bg-insights-title">
          <Reveal className="bg-landing-head">
            <h2 id="bg-insights-title" className="bg-landing-display">See the patterns behind every decision.</h2>
          </Reveal>
          <Reveal delay={120} className="bg-landing-section-illustration">
            <img src="/illustrations/governance-insights.svg" alt="Brand governance insights illustration" loading="lazy" />
          </Reveal>
        </section>

        {/* H — Final CTA */}
        
<section className="bg-landing-cta bg-premium-cta" id="start">
  <div className="bg-premium-cta-orb" aria-hidden="true" />

  <Reveal className="bg-landing-cta-copy bg-premium-cta-content">
    <div className="bg-premium-cta-eyebrow">
      <ShieldCheck size={17} aria-hidden="true" />
      THE FUTURE OF BRAND GOVERNANCE
    </div>

    <h2 className="bg-landing-display">
      Your brand has a voice.
      <br />
      <em>Keep it unmistakable.</em>
    </h2>

    <p className="bg-landing-lede">
      Bring your guidelines, AI-assisted content reviews,
      and human decisions into one intelligent workspace.
      Build brand consistency with confidence.
    </p>

    <div className="bg-premium-cta-actions">
      <MagneticButton
        type="button"
        className="bg-landing-btn bg-premium-cta-button"
        onClick={onGetStarted}
      >
        Create your workspace
        <ArrowRight size={18} aria-hidden="true" />
      </MagneticButton>

      <span className="bg-premium-cta-note">
        <ShieldCheck size={15} aria-hidden="true" />
        AI-assisted. Human-approved.
      </span>
    </div>
  </Reveal>

  <div className="bg-premium-cta-bottom" aria-hidden="true">
    <span>UNWIND BRANDGUARD</span>
    <span>CLARITY · CONSISTENCY · CONTROL</span>
  </div>
</section>

      </main>

      {/* I — Footer */}
      <footer className="bg-landing-footer">
        <div className="bg-landing-footer-top">
          <div>
            <Logo onClick={(e) => goTo(e, 'home')} />
            <p>AI-assisted brand reviews, with people making the final call.</p>
          </div>
          <nav aria-label="Footer">
            <a href="#features" onClick={(e) => goTo(e, 'features')}>Features</a>
            <a href="#how-it-works" onClick={(e) => goTo(e, 'how-it-works')}>How it works</a>
            <button type="button" onClick={onAbout}>About us</button>
            <button type="button" onClick={onSignIn}>Sign in</button>
            <button type="button" onClick={onTerms}>Terms of Service</button>
            <button type="button" onClick={onPrivacy}>Privacy Policy</button>
          </nav>
        </div>
        <p className="bg-landing-footer-note">© Unwind BrandGuard. Prototype.</p>
      </footer>
    </div>
  )
}