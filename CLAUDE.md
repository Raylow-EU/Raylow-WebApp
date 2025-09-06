# claude.md

Operational guide for Claude code sessions on **Raylow**. Use this in every conversation. Keep replies concise and action-oriented.

---

## Session protocol

1. **Read `PLANNING.md` fully** at the start of **every** new conversation.
2. **Open `TASKS.md`**.

   - Pick highest-priority item in `TODO`.
   - If blocked, move item to `BLOCKED` with reason and next step.

3. **Confirm scope** back to user in 3 bullets: goal, deliverable, constraints.
4. **Execute** smallest end-to-end slice first.
5. **Update `TASKS.md` immediately**:

   - Move finished work to `DONE` with date.
   - **Add new tasks** discovered during work with clear titles and owners.

6. **Propose next steps** as 3–5 short bullets tied to repo artifacts.

---

## Project snapshot

- **Name**: Raylow
- **Goal**: Help SMEs discover, manage, and comply with EU regulations.
- **Stack**: React (Vite), Node.js, Supabase Postgres + Auth.
- **Core modules**: Auth & companies, Onboarding (basic + discovery), Regulation forms, Reports, Analytics, AI chat (RAG), Internal messaging, Notifications/Newsletters, Settings.

---

## Repo expectations

```
/frontend/              # React app
  /src/
    /assets
    /features        # product-specific slices
        /auth
          LoginForm.js
          RegisterForm.js
        /onboarding
          BasicOnboardingForm.js
          DiscoveryFlow.js
        /regulations
          RegulationList.js
          RegulationForm.js
        /reports
          ReportsPage.js
          ReportCard.js
    /store
    /supabase
  vite.config.js
/backend/
  /config
  /routes
  /services
  /db
  /workers            # schedulers, newsletter jobs, notifications
  .env.example
  server.js
/supabase/
  /migrations           # SQL
PRD.md
PLANNING.md
TASKS.md
API.md
DATA_MODEL.md
SECURITY.md
OPERATIONS.md
```

**Mandatory files**:

- `PLANNING.md`: current milestone, constraints, acceptance criteria.
- `TASKS.md`: kanban sections `TODO | IN-PROGRESS | BLOCKED | DONE`.
- `API.md`: endpoints, request/response, auth.
- `DATA_MODEL.md`: tables, views, RLS, diagrams.
- `SECURITY.md`: GDPR, secrets, RLS rules, logging policy.
- `OPERATIONS.md`: env, migrations, seeding, scripts, CI.

---

## Environment

Place `.env` inside `/frontend`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Raylow
```

Backend `.env` must include: `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, mail provider keys, and job scheduler creds.

**Never** commit real keys. Provide `.env.example` and use CI secrets.

---

## Data model highlights (Supabase)

Tables (see `DATA_MODEL.md` for full DDL and RLS):

- `companies`, `users` (profiles, role: owner|admin|member), `invites`
- `regulations`, `reg_questions`, `company_regulations`
- `user_responses`, view `v_company_regulation_progress`
- `eligibility_assessments | _questions | _responses | _recommendations`
- `chat_sessions`, `chat_messages` (user-private)
- `reports (id, company_id, regulation_id, status, generated_at, updated_at)`
- `company_messages` (internal threads) \[spec in `DATA_MODEL.md`]

Functions:

- `apply_eligibility_recommendations(assessment_id uuid)` → promotes to `company_regulations` and stamps discovery completion.

**RLS**: enforce tenant isolation on `company_id` and `owner_user_id`. Default `RESTRICT`, then allow via policies.

---

## Feature slices and definitions of done

### Auth & Company

- Email + Google via Supabase.
- Admin can create company and **invite** users.
- DoD: join via invite flow works, roles enforced by RLS.

### Onboarding

- **Step 1** basic profile + company.
- **Step 2** discovery Q\&A → recommendations → promoted assignments.
- DoD: selected regulations appear on dashboard with initial status `in_progress`.

### Dashboard & Analytics

- Cards: regulations list with % complete, due dates, CTA.
- Charts: per-regulation completion using `v_company_regulation_progress`.
- DoD: progress updates after answering any question.

### Regulation Forms

- Render ordered `reg_questions` by type.
- Save draft, validate, submit; writes to `user_responses`.
- DoD: resume works, completion flips status to `completed`, report generated.

### Reports

- Index of **in-progress** and **submitted**.
- Export PDF; persist metadata in `reports`.
- DoD: report file downloads, audit trail recorded.

### AI Chat (RAG)

- Private per user.
- Retrieval over regulation docs + company context (active regs).
- DoD: cites sources, refuses outside scope, no PII leakage.

### Internal Messaging

- Company threads; admins can broadcast.
- Optional per-regulation thread linkage.
- DoD: mention/tag teammates, basic read state.

### Notifications & Newsletters

- Jobs for new/changed regulations, deadlines, reminders.
- User prefs in Settings.
- DoD: email + in-app alerts, opt-out respected.

### Settings

- Company profile, member roles, notification prefs.
- DoD: role changes propagate to RLS immediately.

---

## Working agreements

- **Always** start by reading `PLANNING.md`.
- **Check `TASKS.md`** before coding.
- **Mark completed tasks immediately** with date.
- **Add newly discovered tasks** with clear labels: `feat`, `bug`, `chore`, `docs`.
- Prefer vertical slices. Avoid cross-cutting refactors unless scheduled.

---

## Coding standards

- Javascript on both front and back.
- React: feature-first folders, hooks for data, components for UI.
- API: REST under `/api`, JSON validation, structured responses, 2xx/4xx/5xx clear.
- Errors: structured `{ code, message, details }`.
- Logging: request id, user id, company id. No secrets in logs.
- Tests: unit for pure logic, integration for endpoints, minimal e2e for core flows.
- Migrations: SQL in `/supabase/migrations`; never edit past migrations.

**Current Implementation Status**:
- ✅ Basic onboarding flow with real Supabase database integration
- ✅ User authentication (email/password + Google OAuth)
- ✅ Company creation and user profile management
- ✅ Frontend runs on port 8000 (`npm run dev`)
- ✅ Backend runs on port 3001 (`node server-supabase.js`)
- ✅ Environment variables consolidated across 3 .env files

**Running the Project**:
```bash
# Frontend (terminal 1)
cd frontend && npm run dev

# Backend (terminal 2) 
cd backend && node server-supabase.js
```

---

## Security

- Enforce RLS for every table.
- Access keys: anon on client, service role only on server.
- GDPR: data export/delete endpoints, data minimization, retention policy in `SECURITY.md`.
- Secrets: `.env.local` only, CI secrets for builds.
- PII classification in `DATA_MODEL.md`.

---

## API checklist (see `API.md`)

- `POST /auth/invite`, `POST /auth/accept`
- `GET/POST /onboarding/basic`
- `POST /discovery/start`, `POST /discovery/answer`, `POST /discovery/complete`
- `GET /regulations`, `GET /regulations/:id/questions`
- `POST /responses` (upsert latest), `GET /progress`
- `POST /reports` generate, `GET /reports`, `GET /reports/:id/export`
- `GET/POST /chat/sessions`, `POST /chat/messages`
- `GET/POST /messages` (company threads)
- `POST /notifications/test`, newsletter job endpoints

Each endpoint documented with auth, params, examples, and error codes.

---

## UX guardrails

- Keep flows SME-friendly and linear.
- Show validation early, save drafts automatically.
- Dashboard KPIs: completion %, overdue items, next actions.
- Accessibility: semantic HTML, keyboard navigation, ARIA.

---

## Diagrams

Keep latest user-flow diagrams under `/docs/diagrams`. Update when flows change.

---

## Conversation template

Copy at the start of sessions:

```
Context loaded:
- Read PLANNING.md ✅
- Reviewed TASKS.md ✅ (working on: <task-id>)

Goal:
- <one-sentence goal>

Deliverable:
- <file(s) or endpoint(s)>

Plan:
1) <step>
2) <step>
3) <step>

Risks/Assumptions:
- <item>
- <item>

Exit criteria (DoD):
- <measurable checks>
```

---

## Out of scope for now

- Multi-tenant cross-company analytics.
- Native mobile apps.
- SSO beyond Google.
- Non-EU regulations.

---

## Quality gates before “Done”

- Tests pass locally and in CI.
- No ESLint errors.
- RLS policies exist for any new table.
- `API.md`, `DATA_MODEL.md`, and `TASKS.md` updated.
- Demo comment with screenshots or curl examples.

---

## Notes for future work

- Auto-fill forms from uploaded docs via AI extraction.
- Per-regulation flashcards and learning aids.
- Report templates per regulation with versioning.

---

**Remember**:

- Always read `PLANNING.md`.
- Check `TASKS.md` before you start.
- Mark completed tasks immediately.
- Add newly discovered tasks.
