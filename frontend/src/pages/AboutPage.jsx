import BrandDNAIcon from '../components/BrandDNAIcon.jsx'
import { useEffect } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  ClipboardList,
  FileSearch,
  ListChecks,
  UserCheck,
  Eye,
  BookOpen,
  Repeat
} from 'lucide-react'

import '../App.css'
import './AboutPage.css'

const team = [
  {
  initials: 'PN',
  name: 'Parth Nikam',
  role: 'Founder & CTO',
  description:
    'Led the project vision and technical development, overseeing system architecture, technology decisions, and implementation.',
  linkedin: 'https://www.linkedin.com/in/parth-nikam-535132375/',
  icon: Code2
},
{
  initials: 'AP',
  name: 'Atharva Padwal',
  role: 'CMO & Developer',
  description:
    'Contributed to software development while focusing on brand strategy, marketing direction, and project outreach.',
  linkedin: 'https://www.linkedin.com/in/atharva-padwal-11b005397/',
  icon: Code2
},
{
  initials: 'HA',
  name: 'Harshita Arava',
  role: 'Scrum Master & Project Manager',
  description:
  'Facilitated agile workflows, coordinated team activities, managed project timelines, and ensured smooth collaboration throughout development.',
  linkedin: 'https://www.linkedin.com/in/harshita-arava-64275a319/',
  icon: ClipboardList
}
]

const principles = [
  {
    title: 'Analyse',
    text: 'Submitted content is checked against your approved brand guidelines.',
    icon: FileSearch
  },
  {
    title: 'Review',
    text: 'Potential issues are explained clearly inside a structured review workflow.',
    icon: ListChecks
  },
  {
    title: 'Decide',
    text: 'People make the final approval decision, every time.',
    icon: UserCheck
  }
]

const values = [
  {
    title: 'Guidelines first',
    text: 'Approved brand standards are the reference point for every review.',
    icon: BookOpen
  },
  {
    title: 'Clarity over noise',
    text: 'Issues are explained in plain language, so teams know what to fix and why.',
    icon: Eye
  },
  {
    title: 'People decide',
    text: 'AI assists the review. Approval always stays with a person.',
    icon: UserCheck
  },
  {
    title: 'Consistency every day',
    text: 'Brand quality should hold up in everyday work, not just in launch campaigns.',
    icon: Repeat
  }
]

function useAboutEffects() {
  useEffect(() => {
    window.scrollTo(0, 0)

    const page = document.querySelector('.about-page')
    if (!page) return undefined

    const targets = page.querySelectorAll('[data-reveal]')
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    page.classList.add('reveal-ready')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    targets.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      page.classList.remove('reveal-ready')
    }
  }, [])
}

export default function AboutPage({
  onBack = () => {},
  onGetStarted = () => {},
  onSignIn = () => {}
}) {
  useAboutEffects()

  const handleBrandClick = (event) => {
    // Let ctrl/cmd/shift/middle-click open the real link normally
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return
    }
    event.preventDefault()
    onBack()
  }

  return (
    <main className="about-page">
      <nav className="about-nav" aria-label="About page navigation">
        <a
          className="landing-brand"
          href="/"
          onClick={handleBrandClick}
          aria-label="Unwind BrandGuard home"
        >
          <span className="brand-icon">
            <img
              src="/brandguard-logo.png"
              alt=""
              width="36"
              height="36"
              decoding="async"
            />
          </span>
          <span>
            <strong>UNWIND</strong>
            <small>BRANDGUARD</small>
          </span>
        </a>

        <div className="about-nav-actions">
          <button type="button" className="landing-signin" onClick={onSignIn}>
            Sign in
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={onGetStarted}
          >
            Get started <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>
      </nav>

      <section className="about-hero" aria-labelledby="about-title">
        <span className="eyebrow">
          <span className="status-dot" />
          GET TO KNOW US
        </span>

        <h1 id="about-title">
          About <span>Unwind BrandGuard.</span>
        </h1>

        <p>
          An AI-powered brand governance platform designed to help
          organizations maintain consistency across their content.
          BrandGuard analyses submitted content against approved brand
          guidelines and supports structured review workflows with
          people making the final decisions.
        </p>

        <div className="about-hero-note">
          <BrandDNAIcon size={19} aria-hidden="true" />
          <span>AI-assisted. Human-controlled.</span>
        </div>
      </section>

      <section
        className="about-mission"
        aria-labelledby="about-purpose"
        data-reveal
      >
        <div className="about-section-heading">
          <span className="eyebrow">OUR PURPOSE</span>
          <h2 id="about-purpose">Consistency starts with clarity.</h2>
        </div>

        <div className="ab-mission-copy">
          <p>
            Brand guidelines are valuable only when teams can apply them
            consistently in everyday work. We built Unwind BrandGuard
            to bring approved brand standards, AI-assisted content
            analysis and human review into one workspace.
          </p>

          <p>
            Our approach is to make potential content issues easier to
            understand while keeping review and approval decisions
            in human hands.
          </p>
        </div>

        <ol className="ab-principles">
          {principles.map((item, index) => {
            const Icon = item.icon
            return (
              <li className="ab-principle" key={item.title}>
                <span className="ab-principle-head">
                  <span className="ab-principle-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="ab-principle-step">
                    Step {index + 1}
                  </span>
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            )
          })}
        </ol>
      </section>

      <section
        className="about-team"
        aria-labelledby="about-team-title"
        data-reveal
      >
        <div className="about-section-heading">
          <span className="eyebrow">THE PEOPLE BEHIND THE PROJECT</span>
          <h2 id="about-team-title">Meet the team.</h2>
          <p>
            The people who contributed to building and managing
            Unwind BrandGuard.
          </p>
        </div>

        <div className="about-team-grid">
          {team.map((member) => {
            const Icon = member.icon

            return (
              <article className="about-team-card" key={member.name}>
                <div className="about-member-top">
                  <div className="about-member-avatar" aria-hidden="true">
                    {member.initials}
                  </div>
                  <span className="about-member-icon">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                </div>

                <span className="about-member-role">
                  {member.role}
                </span>

                <h3>{member.name}</h3>

                <p>{member.description}</p>

                <a
                  className="about-linkedin"
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${member.name} on LinkedIn (opens in a new tab)`}
                >
                  <span className="linkedin-text-icon" aria-hidden="true">
                    in
                  </span>
                  LinkedIn profile
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <section
        className="about-technology about-values"
        aria-labelledby="about-values-title"
        data-reveal
      >
        <div className="about-section-heading">
          <span className="eyebrow">WHAT GUIDES US</span>
          <h2 id="about-values-title">Principles we build around.</h2>
          <p>
            The ideas that shape how Unwind BrandGuard helps teams
            keep their content on brand.
          </p>
        </div>

        <ul className="ab-values">
          {values.map((item) => {
            const Icon = item.icon
            return (
              <li className="ab-value" key={item.title}>
                <span className="ab-value-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section
        className="about-bottom-cta"
        aria-labelledby="about-cta-title"
        data-reveal
      >
        <span className="eyebrow">UNWIND BRANDGUARD</span>
        <h2 id="about-cta-title">Build consistency into every review.</h2>
        <p>
          Explore a more structured approach to brand governance.
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={onGetStarted}
        >
          Get started <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </section>

      <footer className="about-footer">
        <span>UNWIND BRANDGUARD</span>
        <span>AI-assisted. Human-controlled.</span>
        <button type="button" onClick={onBack}>
          <ArrowLeft size={14} aria-hidden="true" /> Back to home
        </button>
      </footer>
    </main>
  )
}