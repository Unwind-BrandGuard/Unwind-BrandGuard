
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import './TermsOfServicePage.css'

export default function TermsOfServicePage({ onBack }) {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <button className="legal-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="brand-icon legal-brand-icon">
  <img
    src="/brandguard-logo.png"
    alt="Unwind BrandGuard"
    className="brand-logo"
  />
</div>
      </header>

      <article className="legal-document">
        <span className="legal-eyebrow">LEGAL DOCUMENTATION</span>
        <h1>Terms of Service</h1>
        <p className="legal-updated">Effective date: November 13, 2026</p>

        <p className="legal-intro">
          These Terms of Service govern your access to and use of Unwind
          BrandGuard. By creating an account or using the platform, you agree
          to these terms. If you do not agree, do not use the service.
        </p>

        <section>
          <h2>1. About BrandGuard</h2>
          <p>
            Unwind BrandGuard is an AI-assisted brand governance platform
            designed to help organisations review content against their
            brand guidelines, approved terminology and provided reference
            information.
          </p>
          <p>
            The platform provides content analysis, review findings and
            suggested improvements. It is intended to support human
            decision-making, not replace it.
          </p>
        </section>

        <section>
          <h2>2. Eligibility and Accounts</h2>
          <ul>
            <li>You must provide accurate and current account information.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must not share your account credentials or allow unauthorised access.</li>
            <li>You are responsible for activities performed through your account.</li>
            <li>You must notify the platform operator if you become aware of unauthorised account access.</li>
          </ul>
        </section>

        <section>
          <h2>3. Workspaces and User Roles</h2>
          <p>
            BrandGuard allows users to work within organisation-specific
            workspaces. Workspace access and available actions may depend
            on the role assigned to each member.
          </p>
          <p>
            Workspace owners and administrators are responsible for
            managing invitations, assigning appropriate roles and
            controlling access to workspace information.
          </p>
          <p>
            Users must only access workspaces and information for which
            they have been authorised.
          </p>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the platform for unlawful, fraudulent or harmful activities.</li>
            <li>Attempt to gain unauthorised access to accounts, workspaces or systems.</li>
            <li>Interfere with platform operations, security or availability.</li>
            <li>Upload malicious code or content intended to disrupt the service.</li>
            <li>Misuse invitations, user roles or workspace permissions.</li>
            <li>Use the platform to violate another person's intellectual property, privacy or other rights.</li>
            <li>Reverse engineer, exploit or abuse the platform except where applicable law permits it.</li>
          </ul>
        </section>

        <section>
          <h2>5. Your Content and Brand Materials</h2>
          <p>
            You retain your rights to the content, brand guidelines,
            reference materials and other information that you submit
            to BrandGuard.
          </p>
          <p>
            You are responsible for ensuring that you have the necessary
            rights and permissions to submit and process that material.
          </p>
          <p>
            By using the platform, you authorise BrandGuard to process
            submitted material as reasonably necessary to provide the
            platform's features, including content analysis and review.
          </p>
          <p>
            You must not submit information that you are not authorised
            to share or process.
          </p>
        </section>

        <section>
          <h2>6. AI-Assisted Reviews and Suggestions</h2>
          <p>
            BrandGuard uses artificial intelligence to analyse submitted
            content and generate findings or suggested improvements.
            AI-generated results may be incomplete, inaccurate,
            misleading or unsuitable for a particular situation.
          </p>
          <ul>
            <li>Review findings are suggestions and should not be treated as guaranteed facts.</li>
            <li>AI analysis does not guarantee that content complies with every brand rule or applicable law.</li>
            <li>You must independently verify important claims, facts and recommendations.</li>
            <li>Users remain responsible for reviewing, editing and approving content before publication.</li>
          </ul>
          <p>
            BrandGuard does not automatically guarantee or authorise the
            publication of reviewed content.
          </p>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          <p>
            The BrandGuard platform, including its software, interface,
            branding, design and original platform materials, is owned
            by or used under permission by its respective rights holders.
          </p>
          <p>
            These terms do not transfer ownership of the platform or
            your submitted content to either party.
          </p>
          <p>
            You may not copy, redistribute, modify or commercially exploit
            platform materials except where expressly permitted.
          </p>
        </section>

        <section>
          <h2>8. Third-Party Services</h2>
          <p>
            BrandGuard relies on third-party services to support certain
            functions, including authentication, data storage, hosting,
            AI processing and email delivery.
          </p>
          <p>
            Your use of the platform may involve the processing of
            information by these providers under their respective terms
            and privacy policies. BrandGuard is not responsible for
            independent services or systems operated by third parties.
          </p>
        </section>

        <section>
          <h2>9. Availability and Changes</h2>
          <p>
            BrandGuard may be modified, updated, suspended or discontinued
            as development and operational requirements change.
          </p>
          <p>
            We do not guarantee uninterrupted availability, error-free
            operation or compatibility with every device or environment.
          </p>
        </section>

        <section>
          <h2>10. Suspension and Termination</h2>
          <p>
            Access to the platform may be restricted or suspended where
            necessary to protect the platform, its users or workspace
            information, or where these terms have been violated.
          </p>
          <p>
            Users may stop using the platform at any time. Ending access
            does not automatically determine how previously submitted
            information is retained or handled by the platform or its
            service providers.
          </p>
        </section>

        <section>
          <h2>11. Disclaimer of Warranties</h2>
          <p>
            The platform is provided on an “as available” basis.
            To the extent permitted by applicable law, no warranties
            are made that the service will always be accurate,
            uninterrupted, secure or suitable for every purpose.
          </p>
        </section>

        <section>
          <h2>12. Limitation of Liability</h2>
          <p>
            To the extent permitted by applicable law, BrandGuard and
            its operators will not be liable for indirect, incidental,
            special or consequential losses arising from the use of
            or inability to use the platform.
          </p>
          <p>
            Nothing in these terms excludes liability that cannot
            legally be excluded or limited.
          </p>
        </section>

        <section>
          <h2>13. Changes to These Terms</h2>
          <p>
            These terms may be updated as the platform evolves.
            Updated terms will be published on this page with a
            revised effective date. Continued use of the platform
            after an update constitutes acceptance of the revised
            terms, to the extent permitted by applicable law.
          </p>
        </section>

        <section>
          <h2>14. Governing Law</h2>
          <p>
            These terms are subject to applicable laws. Any
            interpretation or enforcement will be governed by
            the laws applicable to the platform operator and
            the relevant user relationship.
          </p>
        </section>
      </article>

      <footer className="legal-footer">
        UNWIND BRANDGUARD · AI-ASSISTED, HUMAN-CONTROLLED GOVERNANCE
      </footer>
    </main>
  )
}