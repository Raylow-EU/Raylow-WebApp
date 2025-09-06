# PLANNING.md

## Vision

Raylow is a compliance assistant for SMEs in Europe.
The platform helps companies:

- **Discover** which regulations apply to them.
- **Comply** by filling forms, generating reports, and tracking progress.
- **Collaborate** across teams with invites, messaging, and role-based access.
- **Learn** through flashcards, analytics, and AI-powered chat.
- **Stay informed** via newsletters and real-time notifications of new or changing regulations.

Goal: make regulatory compliance **accessible, actionable, and continuous** for SMEs to make reporting an easier, more efficient, cost-effective method and also for SMEs that lack dedicated compliance staff.

## Current Implementation Status (2025-01-06)

✅ **Completed**:
- Landing page with authentication (email/password + Google OAuth)
- Basic onboarding flow with user and company registration  
- Real Supabase database integration (companies and users tables)
- Frontend-backend communication with proper CORS configuration
- Redux Toolkit state management for authentication and onboarding
- Environment variable consolidation across root, frontend, and backend

🔄 **Next Focus**: Dashboard and analytics (Milestone 2)

---

## Architecture

### Frontend

- **React (Vite)**.
- Feature-first folder structure under `/src/features/`.
- Component-driven UI with Javascript.
- Communicates with Supabase (for auth and DB) and Node.js backend API.

### Backend

- **Node.js (Javascript)** with REST API.
- Acts as middleware between frontend and Supabase for:

  - Role validation and RLS policies.
  - Secure functions (report generation, newsletter jobs).
  - Background jobs (scheduled tasks).

### Database

- **Supabase (Postgres)** with:

  - Tables for companies, users, regulations, forms, reports, messaging, chat.
  - Row-Level Security (RLS) enforcing company isolation.
  - Functions for discovery (`apply_eligibility_recommendations`).
  - Views for computed progress.

- Migrations tracked under `/supabase/migrations`.

### Data flows

- User login → Supabase Auth → `users` table profile.
- Company creation → `companies` + admin `users`.
- Regulation discovery → `eligibility_*` tables → recommendations → `company_regulations`.
- Form filling → `user_responses` → progress view.
- Report submission → `reports`.
- Messaging/chat → `chat_sessions`, `chat_messages`, `company_messages`.
- Analytics → query `v_company_regulation_progress` and report stats.

### Integrations

- Email delivery (invites, newsletters, alerts).
- Storage for report exports (Supabase storage or S3).
- RAG knowledge base for AI chat.

---

## Technology Stack

**Frontend**

- React + Vite (port 8000)
- Javascript
- Redux Toolkit (state management)
- CSS (UI)
- React Icons + Lucide (icons)
- React Router DOM (routing)

**Backend**

- Node.js + Express (port 3001)
- Javascript ES modules
- JSON schema validation
- Supabase JS client
- CORS configured for local development
- Current server: `server-supabase.js` (real DB integration)

**Database (Supabase)**

- Postgres 15
- Supabase Auth (Email, Google)
- Row Level Security policies
- SQL migrations and views

**AI & Messaging**

- RAG over regulation documents (vector DB, Supabase pgvector extension or external service)
- WebSocket or Supabase Realtime for messaging

---

## Required Tools

**Development**

- Git + GitHub/GitLab for version control
- Cursor with Claude Code with recommended extensions (ESLint, Prettier, Supabase)
- npm as package manager
- Supabase CLI for migrations

**Testing**

- Vitest + React Testing Library (frontend)
- Jest or Vitest (backend)
- Postman/Insomnia for API testing

**Collaboration & Docs**

- `TASKS.md` for ongoing work
- `claude.md` for AI coding protocol
- `DATA_MODEL.md` for schema
- `API.md` for endpoints
- `SECURITY.md` for compliance and GDPR notes
- `OPERATIONS.md` for deploy/run instructions

**Deployment**

- Vercel / Netlify for frontend hosting
- Render / Railway / Supabase Functions for backend jobs
- Supabase cloud for DB + auth
- CI/CD via GitHub Actions
