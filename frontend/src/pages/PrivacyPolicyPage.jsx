
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import './PrivacyPolicyPage.css'

export default function PrivacyPolicyPage({ onBack }) {
  return (
    <main className="privacy-page">
      <header className="privacy-header">
        <button className="privacy-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="privacy-brand">
          <ShieldCheck size={23} />
          <span>
            <strong>UNWIND</strong>
            <small>BRANDGUARD</small>
          </span>
        </div>
      </header>

      <article className="privacy-document">
        <span className="privacy-eyebrow">LEGAL DOCUMENTATION</span>
        <h1>Privacy Policy</h1>
        <p className="privacy-updated">Effective date: November 13, 2026</p>

        <p className="privacy-intro">
          This Privacy Policy explains how Unwind BrandGuard collects,
          uses, processes and shares information when you use the platform.
          By using BrandGuard, you acknowledge the practices described
          in this policy.
        </p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>Depending on how you use BrandGuard, information may include:</p>
          <ul>
            <li><strong>Account information:</strong> name, email address and authentication-related information.</li>
            <li><strong>Workspace information:</strong> workspace or organisation name, membership details and assigned roles.</li>
            <li><strong>Submitted content:</strong> text submitted for review, brand guidelines, approved terminology and reference information.</li>
            <li><strong>Review information:</strong> AI-generated findings, suggestions and review-related records.</li>
            <li><strong>Technical information:</strong> operational logs, error information and limited technical data required to maintain the service.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Information</h2>
          <p>Information may be used to:</p>
          <ul>
            <li>Create and manage user accounts.</li>
            <li>Authenticate users and provide workspace access.</li>
            <li>Manage workspace membership, invitations and roles.</li>
            <li>Analyse submitted content against provided brand guidelines and references.</li>
            <li>Generate review findings and suggested improvements.</li>
            <li>Store and display content review records.</li>
            <li>Send account-related and workspace invitation emails.</li>
            <li>Maintain, troubleshoot and improve platform functionality and security.</li>
          </ul>
        </section>

        <section>
          <h2>3. AI Processing</h2>
          <p>
            BrandGuard uses Google's Gemini AI service to assist with
            content analysis and review generation.
          </p>
          <p>
            Content and relevant brand guidelines submitted for review
            may be transmitted to the AI service so that it can generate
            findings and suggestions.
          </p>
          <p>
            AI-generated results may be inaccurate or incomplete.
            Users should independently verify important information
            and must not treat AI output as a substitute for human review.
          </p>
          <p>
            Avoid submitting sensitive personal information,
            confidential business information or other restricted
            material unless you are authorised to do so and understand
            the processing involved.
          </p>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>
            BrandGuard uses third-party providers to operate and
            support different parts of the platform. These may include:
          </p>
          <ul>
            <li><strong>Supabase:</strong> authentication and database services.</li>
            <li><strong>Google Gemini:</strong> AI-assisted content analysis.</li>
            <li><strong>Render:</strong> backend application hosting.</li>
            <li><strong>Vercel:</strong> frontend application hosting and deployment.</li>
            <li><strong>Brevo:</strong> transactional email delivery, including workspace invitations.</li>
          </ul>
          <p>
            When information is processed by these providers, their
            respective privacy policies and service terms may also apply.
            Their handling of information is subject to their own
            systems, policies and applicable agreements.
          </p>
        </section>

        <section>
          <h2>5. Data Storage and Retention</h2>
          <p>
            Account, workspace and review information may be stored
            using the platform's database and infrastructure providers.
          </p>
          <p>
            Information may be retained for as long as necessary to
            provide the service, maintain workspace records, meet
            operational requirements, resolve disputes or comply
            with applicable obligations.
          </p>
          <p>
            Retention periods may also depend on the policies and
            technical practices of the third-party providers used
            by the platform.
          </p>
          <p>
            Deleting or stopping use of an account does not necessarily
            mean that all related information is immediately deleted
            from every system or backup.
          </p>
        </section>

        <section>
          <h2>6. Information Sharing</h2>
          <p>
            BrandGuard does not make submitted workspace content
            publicly available as a general feature of the platform.
          </p>
          <p>Information may be shared or processed:</p>
          <ul>
            <li>By service providers when required to operate platform features.</li>
            <li>With authorised members of the relevant workspace, according to their roles and permissions.</li>
            <li>Where required by applicable law or a valid legal request.</li>
            <li>Where reasonably necessary to protect the platform, its users or its systems.</li>
          </ul>
        </section>

        <section>
          <h2>7. Data Security</h2>
          <p>
            BrandGuard uses third-party infrastructure and technical
            measures intended to support account security and the
            operation of the platform.
          </p>
          <p>
            No online service or method of electronic storage and
            transmission can be guaranteed to be completely secure.
            Users should protect their credentials and avoid submitting
            information they are not authorised to share.
          </p>
        </section>

        <section>
          <h2>8. Your Privacy Responsibilities and Rights</h2>
          <p>
            Depending on applicable law, you may have rights relating
            to your personal information, including rights to access,
            correct or request deletion of certain information.
          </p>
          <p>
            The availability and scope of these rights depend on
            applicable legal requirements and the circumstances
            of the processing.
          </p>
          <p>
            Users should ensure that the personal information and
            business material they submit to BrandGuard may lawfully
            be processed for the intended purpose.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            BrandGuard is intended for organisational and professional
            use and is not designed to knowingly collect personal
            information from children.
          </p>
        </section>

        <section>
          <h2>10. External Websites and Services</h2>
          <p>
            The platform may rely on or link to third-party websites
            and services. BrandGuard does not control the privacy
            practices of external services. Users should review
            the relevant policies before using them.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            This policy may be updated as BrandGuard's features,
            infrastructure or data practices change. Updates will
            be published on this page with a revised effective date.
          </p>
        </section>

        <section>
          <h2>12. Relationship with the Terms of Service</h2>
          <p>
            This Privacy Policy should be read together with the
            BrandGuard Terms of Service. The two documents describe
            the conditions of platform use and the handling of
            information associated with that use.
          </p>
        </section>
      </article>

      <footer className="privacy-footer">
        UNWIND BRANDGUARD · PRIVACY AND DATA HANDLING
      </footer>
    </main>
  )
}