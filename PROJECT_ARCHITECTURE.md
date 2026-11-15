<div align="center">

<h1>🛡️ Unwind BrandGuard</h1>

<h3>Project Architecture</h3>

<p><b>✨ Define. Analyze. Protect. ✨</b></p>

<p><i>AI-assisted, human-controlled brand governance for teams that care about consistency.</i></p>

<p>
<a href="#-1-executive-summary">Overview</a> ·
<a href="#-3-system-architecture">Architecture</a> ·
<a href="#-8-ai-content-analysis-architecture">AI Analysis</a> ·
<a href="#-13-security-considerations">Security</a> ·
<a href="#-12-deployment-architecture">Deployment</a>
</p>

</div>

---

|  |  |
|---|---|
| 📄 **Document type** | Architecture reference |
| 👥 **Audience** | Engineers, product owners, reviewers, stakeholders |
| 🔄 **Status** | Living document |

---

## 📚 Table of Contents

1. 📌 [Executive Summary](#-1-executive-summary)
2. 🎯 [Goals, Non-Goals, and Principles](#-2-goals-non-goals-and-principles)
3. 🧱 [System Architecture](#-3-system-architecture)
4. 💻 [Frontend Architecture](#-4-frontend-architecture)
5. 🔧 [Backend Architecture](#-5-backend-architecture)
6. 🔑 [Authentication and Authorization](#-6-authentication-and-authorization)
7. 💾 [Database Architecture](#-7-database-architecture)
8. 🤖 [AI Content Analysis Architecture](#-8-ai-content-analysis-architecture)
9. 👥 [Workspace and Team Management](#-9-workspace-and-team-management)
10. 📝 [Content Review Architecture](#-10-content-review-architecture)
11. 🔌 [External Integrations](#-11-external-integrations)
12. 🚀 [Deployment Architecture](#-12-deployment-architecture)
13. 🔒 [Security Considerations](#-13-security-considerations)
14. 📈 [Operations, Quality, and Scalability](#-14-operations-quality-and-scalability)
15. 🔮 [Future Architectural Enhancements](#-15-future-architectural-enhancements)
16. 🧭 [Key Architectural Decisions](#-16-key-architectural-decisions)
17. 🏁 [Conclusion](#-17-conclusion)

---

## 📌 1. Executive Summary

Unwind BrandGuard is an AI-powered brand governance platform that helps organizations keep their identity consistent across every piece of content they publish. Teams define their brand rules once, submit content for analysis, and receive explainable findings tied to the exact guideline that was violated. People, not the model, make the final call.

The platform combines five capabilities in one workspace-based product:

- **Configurable brand guidelines** organized into clear rule categories.
- **AI content analysis** powered by Google Gemini, grounded strictly in supplied rules.
- **Structured review workflows** with a defined status lifecycle.
- **Team collaboration** through workspaces, roles, and email invitations.
- **Defense-in-depth security** across the API, database, and secrets layers.

### 🧩 Architecture at a Glance

| Concern | Choice |
|---|---|
| Frontend | React 19, Vite, React Router, Lucide React |
| Backend | Node.js, Express.js (REST) |
| Database | Supabase PostgreSQL with Row Level Security |
| Authentication | Supabase Auth |
| AI engine | Google Gemini API |
| Email | Brevo |
| Hosting | Vercel (frontend), Render (backend), Supabase (data and auth) |
| Source control | GitHub |

---

## 🎯 2. Goals, Non-Goals, and Principles

### ✅ 2.1 Goals

1. Make brand compliance **explainable**: every finding points to a real guideline.
2. Keep **humans in control** of approval decisions.
3. Guarantee **workspace isolation** so organizations never see each other's data.
4. Keep secrets and privileged operations **server-side only**.
5. Stay **modular** so any integration (AI, email, auth) can be swapped with limited blast radius.

### 🚫 2.2 Non-Goals (Current Version)

- Automated publishing or auto-approval of content without human review.
- Analysis of images, video, or documents (planned, see [Section 15](#-15-future-architectural-enhancements)).
- Fine-tuning or training custom models on customer content.

### 🧠 2.3 Design Principles

| Principle | What it means in practice |
|---|---|
| AI-assisted, human-controlled | The model proposes findings; reviewers decide outcomes. |
| Explainability | Each finding states what, why, which guideline, and how to fix it. |
| Workspace isolation | Access is enforced by membership and role at both API and database layers. |
| Defense in depth | No single control is trusted alone; middleware and RLS back each other up. |
| Modular architecture | Frontend, backend, data, AI, and email have distinct responsibilities. |
| Practical usability | Compliance should be understandable for real teams, not only specialists. |

---

## 🧱 3. System Architecture

Unwind BrandGuard uses a frontend-backend architecture with managed services for identity, data, AI, and email.

### 3.1 Components

| # | Component | Responsibility |
|---|---|---|
| 1 | Frontend application | User interface and application workflows |
| 2 | Backend API | Server-side logic, validation, and external integrations |
| 3 | Authentication layer | User identity and session management |
| 4 | Database layer | Workspaces, guidelines, memberships, invitations, reviews |
| 5 | AI processing layer | Guideline-grounded content evaluation |
| 6 | Email integration | Delivery of workspace invitations |

### 🗺️ 3.2 High-Level Architecture

```text
                        USER (Browser)
                              |
                              v
                 REACT FRONTEND  (Vercel)
                              |
              +---------------+----------------+
              |                                |
              v                                v
        SUPABASE AUTH                    EXPRESS API  (Render)
   (sign-in, sessions, JWT)                    |
                                  +------------+------------+
                                  |            |            |
                                  v            v            v
                             GEMINI API   SUPABASE DB     BREVO
                            (analysis)   (PostgreSQL+RLS) (email)
                                  |            |
                                  +-----+------+
                                        |
                                        v
                              CONTENT REVIEW RESULTS
```

### 🚧 3.3 Trust Boundaries

Understanding where trust changes is central to the security model.

```text
+--------------------------------------------------------------+
| UNTRUSTED ZONE: Browser                                      |
|  - Public Supabase URL and anon key only                     |
|  - User JWT held in session                                  |
+--------------------------------------------------------------+
                    | HTTPS + Bearer token
                    v
+--------------------------------------------------------------+
| TRUSTED ZONE: Express backend (Render)                       |
|  - Gemini API key                                            |
|  - Privileged Supabase credentials                           |
|  - Brevo API key                                             |
+--------------------------------------------------------------+
                    | Server-to-server calls
                    v
+--------------------------------------------------------------+
| MANAGED SERVICES: Supabase, Gemini, Brevo                    |
+--------------------------------------------------------------+
```

---

## 💻 4. Frontend Architecture

The frontend is a single-page application built with React and Vite.

### 4.1 Technology

- React 19
- Vite (development server and production builds)
- JavaScript and CSS
- React Router (client-side routing)
- Lucide React (iconography)
- Supabase JavaScript client

### 4.2 Core Responsibilities

- Render the application interface and navigation.
- Manage authentication-related UI states (signed out, loading, signed in, expired).
- Display workspace information and membership context.
- Provide guideline management interfaces by category.
- Submit content for AI analysis and present structured findings.
- Support the content review workflow and status changes.
- Manage workspace settings, team members, and invitations.

### 4.3 Data Access Pattern

The frontend talks to two systems, each for a distinct purpose:

| Target | Used for |
|---|---|
| Supabase (direct) | Authentication and database operations that are safe under RLS |
| Express API | Anything requiring secrets, third-party calls, or privileged logic: AI analysis, invitations, email |

### 4.4 Frontend Guidelines

- Only public, non-privileged configuration values are bundled into client code.
- UI role checks improve experience but are **never** treated as security; the backend and RLS are the source of truth.
- Every analysis and mutation call should surface loading, success, and error states clearly.

---

## 🔧 5. Backend Architecture

The backend is a Node.js and Express.js service that sits between the frontend, the AI provider, the email service, and the database.

### 5.1 Core Responsibilities

- Handle REST API requests.
- Validate authenticated requests.
- Enforce workspace membership and role requirements.
- Process content analysis requests.
- Communicate with Google Gemini.
- Manage workspace invitation operations.
- Send invitation emails through Brevo.
- Perform authorized database operations.
- Apply request validation and rate limiting.

### 5.2 Request Pipeline

Every protected request passes through the same ordered chain of middleware before reaching business logic.

```text
Incoming request
      |
      v
[1] CORS and transport checks
      |
      v
[2] Rate limiting
      |
      v
[3] Authentication (verify Supabase JWT)
      |
      v
[4] Input validation (schema, content length)
      |
      v
[5] Workspace membership verification
      |
      v
[6] Role-based authorization
      |
      v
[7] Route handler / service logic
      |
      v
[8] Structured response or standardized error
```

### 5.3 Suggested Layering

A layered structure keeps the codebase testable and the integrations replaceable.

| Layer | Role |
|---|---|
| Routes | Map HTTP endpoints to handlers |
| Middleware | Authentication, validation, authorization, rate limiting |
| Controllers | Translate requests into service calls and responses |
| Services | Business logic: analysis orchestration, invitations, reviews |
| Integrations | Thin clients for Gemini, Brevo, and Supabase |

### 5.4 Representative API Surface

The table below illustrates the shape of the API by domain. Exact paths may differ in implementation.

| Domain | Typical operations |
|---|---|
| Analysis | Submit content for analysis within a workspace |
| Guidelines | Create, read, update, and remove rules by category |
| Reviews | Create review records, update status, retrieve history |
| Invitations | Create, resend, revoke, and accept invitations |
| Workspaces and members | Read workspace details, manage roles and membership |

### 5.5 Error Handling Conventions

- Use consistent HTTP status codes: `400` validation, `401` unauthenticated, `403` unauthorized, `404` not found, `429` rate limited, `5xx` server or upstream failure.
- Return a predictable error body (code, message, optional details) without leaking internals or secrets.
- Distinguish upstream AI failures from application failures so the UI can offer a sensible retry.

---

## 🔑 6. Authentication and Authorization

### 6.1 Authentication

Supabase Auth manages user identity. After sign-in, the client holds a session token that is sent to the Express API as a bearer token. The backend verifies it on every protected request.

### 6.2 Authorization Model

Authorization is evaluated in two independent places:

1. **Application layer:** backend middleware checks workspace membership and role.
2. **Data layer:** Supabase Row Level Security restricts what each authenticated user can read or write.

This redundancy means a bug in one layer does not automatically become a data breach.

### 🪪 6.3 Role Permission Matrix

| Capability | Owner | Admin | Editor | Reviewer | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| View workspace content | Yes | Yes | Yes | Yes | Yes |
| Submit content for analysis | Yes | Yes | Yes | No | No |
| Update review status and decisions | Yes | Yes | No | Yes | No |
| Manage brand guidelines | Yes | Yes | No | No | No |
| Invite and manage members | Yes | Yes | No | No | No |
| Manage workspace settings | Yes | Yes | No | No | No |
| Transfer or delete workspace | Yes | No | No | No | No |

> [!NOTE]
> 📝 This matrix reflects the role purposes defined for the platform. Confirm it against the enforced policies and adjust as requirements evolve.

---

## 💾 7. Database Architecture

Supabase PostgreSQL provides persistent storage with workspace-centric organization.

### 7.1 Major Entities

| Entity | Responsibility |
|---|---|
| `workspaces` | Stores brand or organization workspace information |
| `workspace_members` | Maintains membership and roles per workspace |
| `brand_guidelines` | Stores brand-specific rules and their categories |
| `content_reviews` | Stores submitted content, findings, and review status |
| `invitations` | Supports invitation creation, tracking, and acceptance |

### 7.2 Entity Relationships

```text
workspaces (1) ------< workspace_members >------ (1) auth users
    |
    +------< brand_guidelines
    |
    +------< content_reviews
    |
    +------< invitations
```

Every workspace-scoped record carries a workspace reference, which is the foundation of isolation.

### 🎨 7.3 Brand Guideline Categories

| Category | Purpose |
|---|---|
| Voice and Tone | How the brand sounds: formality, personality, style |
| Approved Terminology | Preferred names, product terms, and vocabulary |
| Approved Facts | Verified statements the brand can safely make |
| Prohibited Claims | Statements, promises, or phrasing that must not appear |
| Accessibility | Inclusive language and readability expectations |
| Visual Identity | Rules for color, typography, logo usage, and imagery |
| Other Guidelines | Any rule that does not fit the categories above |

### 🛡️ 7.4 Row Level Security

RLS restricts every database operation according to the authenticated user's identity. Policies rely on workspace membership and role to decide which rows a user can see and which operations they can perform.

**Recommended practices**

- Enable RLS on every table that holds workspace data.
- Write policies as explicit allow rules; default to deny.
- Index membership lookup columns, since policies query them frequently.
- Keep privileged service credentials on the backend only, and use them sparingly.

---

## 🤖 8. AI Content Analysis Architecture

Google Gemini is the AI engine. It evaluates submitted text against the guidelines that apply to the workspace.

### 8.1 Analysis Workflow

```text
USER SUBMITS CONTENT
         |
         v
BACKEND RECEIVES REQUEST
         |
         v
AUTHENTICATION AND VALIDATION
         |
         v
VERIFY WORKSPACE MEMBERSHIP
         |
         v
RETRIEVE RELEVANT GUIDELINES
         |
         v
ASSEMBLE PROMPT: CONTENT + GUIDELINES + INSTRUCTIONS
         |
         v
SEND TO GOOGLE GEMINI
         |
         v
PARSE AND VALIDATE STRUCTURED OUTPUT
         |
         v
RETURN FINDINGS TO USER
         |
         v
CONTENT REVIEW WORKFLOW
```

### 8.2 Analysis Objectives

1. Evaluate content against the supplied brand guidelines.
2. Identify potential compliance violations.
3. Explain why each issue was detected.
4. Reference the specific guideline involved.
5. Provide actionable correction suggestions.
6. Preserve the original intent of the content.

### 8.3 Structured Finding Shape

Each finding should be returned in a consistent structure so the UI can render it reliably.

| Field | Description |
|---|---|
| `issue` | A short description of what was found |
| `excerpt` | The exact passage in the content that triggered the finding |
| `guideline reference` | The supplied guideline (and category) the finding relies on |
| `explanation` | Why the passage conflicts with the guideline |
| `suggested fix` | A rewrite or action that resolves the issue while keeping intent |
| `severity` | A relative level, such as low, medium, or high |

### 🔍 8.4 Explainability and Grounding Rules

The central rule is simple: **the AI must not invent brand rules or cite guidelines that were not supplied.**

To support this, the analysis layer should:

- Provide the model with only the guidelines for the current workspace.
- Instruct the model to reference guidelines by their supplied identity.
- Validate that every cited guideline in the response exists in the supplied set; discard or flag findings that do not.
- Treat user-submitted content as **data to analyze**, never as instructions to follow (a defense against prompt injection).
- Request a strict output format and validate it before display; handle malformed output gracefully.

### 8.5 AI Reliability and Cost Controls

- Enforce content length limits before calling the model.
- Apply per-user and per-workspace rate limits.
- Use timeouts and bounded retries with backoff for upstream failures.
- Return clear messages when the AI service is unavailable, without losing the user's submitted content.
- Log request metadata (workspace, size, duration, outcome) for monitoring, avoiding unnecessary retention of sensitive content in logs.

---

## 👥 9. Workspace and Team Management

Each workspace represents one brand or organizational environment.

### 9.1 Roles

| Role | Purpose |
|---|---|
| Owner | Controls workspace ownership |
| Admin | Manages administrative operations |
| Editor | Creates and submits content |
| Reviewer | Reviews submitted content |
| Viewer | Provides read-only access |

Permissions are enforced through application logic and database security policies.

### ✉️ 9.2 Invitation Workflow

```text
Authorized member initiates invitation
         |
         v
Backend validates request and caller's role
         |
         v
Invitation record created (token generated)
         |
         v
Invitation email sent through Brevo
         |
         v
Recipient opens invitation link
         |
         v
Recipient authenticates and accepts
         |
         v
Acceptance establishes workspace membership
```

### 9.3 Invitation Security Practices

- Generate tokens with a cryptographically secure random source.
- Prefer storing a hash of the token rather than the raw value.
- Set an expiry and invalidate the invitation after use.
- Support revocation by authorized members.
- Bind acceptance to an authenticated user and verify the invitation is still valid.
- Perform the membership creation atomically so a partial acceptance cannot occur.

---

## 📝 10. Content Review Architecture

AI analysis provides findings; people make decisions.

### 🔄 10.1 Review Lifecycle

```text
   PENDING ---> IN REVIEW ---+---> APPROVED
                   ^         |
                   |         +---> REJECTED
                   |         |
                   +---------+---> CHANGES REQUESTED
                                        |
                                        v
                                (resubmit as new revision)
```

| Status | Meaning |
|---|---|
| Pending | Submitted and analyzed; awaiting a reviewer |
| In Review | A reviewer is actively evaluating |
| Changes Requested | Edits are needed before approval |
| Approved | Content meets brand standards |
| Rejected | Content will not proceed |

### 10.2 Review Process

1. Content is submitted for analysis.
2. Gemini evaluates it against the brand guidelines.
3. Findings are presented to the user.
4. Authorized users take part in the review workflow.
5. The review status is updated.
6. Review information is persisted for future reference.

### 10.3 Review Governance Notes

- Only roles with review authority may change status.
- Status transitions should be validated server-side so invalid jumps are rejected.
- Record who made each decision and when, forming the basis for the audit trail described in [Section 15](#-15-future-architectural-enhancements).

---

## 🔌 11. External Integrations

| Integration | Purpose | Key handling |
|---|---|---|
| Google Gemini API | AI-powered content analysis and guideline-based evaluation | API key held on the backend only |
| Supabase | PostgreSQL, authentication, access policies, persistent data | Public client key in browser; privileged key on backend only |
| Brevo | Workspace invitation email delivery | API key held on the backend only |

These integrations keep the platform modular without implementing every infrastructure component independently. Each integration should sit behind a thin client module so it can be mocked in tests or replaced later.

---

## 🚀 12. Deployment Architecture

| Component | Hosting platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase |
| Authentication | Supabase Auth |
| Source control | GitHub |

### 12.1 Platform Responsibilities

**Vercel**
- Hosts the React frontend.
- Runs frontend production builds.
- Provides frontend deployment and delivery.

**Render**
- Hosts the Express backend.
- Runs backend API services.
- Provides backend environment configuration.

**Supabase**
- Hosts PostgreSQL.
- Provides authentication.
- Enforces configured database security policies.

### 12.2 Environments and Configuration

- Maintain separate development and production configurations.
- Store all secrets as environment variables on the hosting platform, never in source control.
- Restrict CORS on the backend to the known frontend origins.
- Keep production and development Supabase projects separate where possible.

### 12.3 Delivery Flow

```text
Developer pushes to GitHub
         |
   +-----+------+
   |            |
   v            v
Vercel build   Render build
(frontend)     (backend)
   |            |
   v            v
Production     Production
frontend       API
```

---

## 🔒 13. Security Considerations

### 13.1 Control Summary

| Control | Where it applies |
|---|---|
| Authentication for protected operations | Backend middleware |
| Workspace membership verification | Backend middleware |
| Role-based authorization | Backend and database |
| Row Level Security | Database |
| Server-side API key management | Backend |
| Secure invitation token handling | Backend and database |
| API rate limiting | Backend |
| Input validation | Backend |
| Restricted content request sizes | Backend |
| Environment variable management | All environments |

> [!IMPORTANT]
> 🔐 Privileged credentials must never be exposed in client-side code or committed to version control.

### ⚠️ 13.2 Threat Considerations

| Threat | Primary mitigations |
|---|---|
| Cross-workspace data access | Membership checks plus RLS on every workspace-scoped table |
| Privilege escalation | Server-side role checks; role changes limited to Owner and Admin |
| Secret leakage | Backend-only secrets; secret scanning; environment-based config |
| Prompt injection via submitted content | Treat content as data; validate model output against supplied guidelines |
| Invitation token abuse | Expiry, single use, hashed storage, revocation |
| Abuse and cost exhaustion | Rate limits and content length caps |
| Hallucinated findings | Grounding rules and response validation |

### 13.3 Privacy Considerations

- Submitted content and guidelines may be commercially sensitive; limit what is written to logs.
- Send the model only what is needed for analysis.
- Review and document the data-handling terms of each external provider as part of onboarding customers.

---

## 📈 14. Operations, Quality, and Scalability

### 14.1 Observability

- Structured, correlated logging across request, analysis, and email events.
- Health check endpoint for the backend to support platform monitoring.
- Tracking of key signals: analysis latency, AI failure rate, rate-limit hits, invitation delivery outcomes.

### 14.2 Testing Strategy

| Level | Focus |
|---|---|
| Unit | Services, validation logic, prompt assembly, output parsing |
| Integration | Middleware chain, database policies, invitation acceptance |
| Authorization | Verify each role can and cannot perform each operation |
| AI evaluation | A curated set of sample content and guidelines to catch regressions in finding quality and grounding |

### 📊 14.3 Scalability Path

- The Express backend is stateless, so it can scale horizontally behind the host's load balancing.
- Long or heavy analyses can later move to a background job queue with status polling.
- Common reads (such as a workspace's guidelines) are good candidates for caching.
- Database indexes on workspace and membership columns keep policy checks fast as data grows.

---

## 🔮 15. Future Architectural Enhancements

### 🖼️ 15.1 Multimodal Analysis

Introduce image and document processing to evaluate visual brand consistency, logo usage, typography, and other visual elements.

### 💬 15.2 Collaborative Review System

Expand review functionality with comments, revision tracking, reviewer feedback, and detailed approval history.

### 📉 15.3 Brand Compliance Analytics

Introduce analytics to identify recurring violations, monitor compliance patterns, and provide actionable workspace-level insights.

### 15.4 Additional Ideas for Consideration

| Enhancement | Value |
|---|---|
| Audit log | Immutable record of decisions, role changes, and guideline edits |
| Guideline versioning | Know which rule version a past review was evaluated against |
| Notifications | Alerts for review assignments and status changes |
| Integrations | Connect to CMS, design, and collaboration tools |
| SSO and enterprise controls | Meet larger-organization identity requirements |
| Background processing | Queue-based analysis for large submissions |

---

## 🧭 16. Key Architectural Decisions

| Decision | Rationale | Trade-off |
|---|---|---|
| Separate Express backend rather than frontend-only | Keeps secrets and privileged logic off the client | Adds a service to deploy and operate |
| Supabase for auth and data | Fast delivery with built-in RLS and auth | Ties policy design to Supabase and PostgreSQL |
| Dual enforcement (middleware and RLS) | Defense in depth for workspace isolation | Rules must be kept consistent across two layers |
| Gemini behind a thin integration | Replaceable AI provider; grounded prompts | Prompt and output handling must be maintained |
| Human-controlled review | Accountability and trust in decisions | Review effort remains a human cost |
| Managed email via Brevo | Reliable delivery without custom infrastructure | Dependency on a third-party service |

---

## 🏁 17. Conclusion

Unwind BrandGuard unites AI-powered content analysis, configurable brand guidelines, workspace management, collaboration, and structured review into one platform. Its architecture favors explainability, security, and clean separation of concerns, with Gemini providing intelligence, Supabase providing identity and data protection, and the Express backend guarding every privileged operation.

By pairing automated analysis with human-controlled decisions, the platform helps organizations protect and maintain their brand identity consistently, and it is built to grow with them.

<div align="center">

**🛡️ Unwind BrandGuard — Define. Analyze. Protect.**

</div>
