# TASKS.md

## Milestone 0 – Foundation (✅ Completed)

- [x] Build **Landing Page** with CTA → sign up/login.
- [x] Implement **Authentication** (Email via Supabase).
- [x] Redirect authenticated users into **Personal Space**.

---

## Milestone 1 – Onboarding

### Step 1: Basic Onboarding (Account & Company Setup) ✅ COMPLETED 2025-01-06

- [x] Build account creation flow → after auth, redirect to onboarding form.
- [x] Capture basic user info (full name, role).
- [x] Capture basic company info (name, sector, size).
- [x] Write user + company data to users and companies tables.
- [x] Mark users.onboarding_basic_completed_at.
- [x] Fixed database integration with proper email handling via Supabase Auth.
- [x] Redirect user to personalized space (dashboard shell).
- [ ] Allow company admins to send email invites (invites table).

### Step 2: Regulation Discovery (Deeper Onboarding)

- [ ] Add button in personal space → “Find out what regulations concern {Company_Name}!”.
- [ ] Render short Q&A flow from eligibility_questions.
- [ ] Save answers in eligibility_responses.
- [ ] Generate recommendations in eligibility_recommendations.
- [ ] Run function apply_eligibility_recommendations → promote to company_regulations.
- [ ] Show assigned regulations list on dashboard.
- [ ] Mark company as reg_discovery_completed_at when done.

### Step 3: Regulation Discovery

- [ ] Build UI for “**Find out what regulations concern {Company_Name}**”.
- [ ] Render short Q\&A flow using `eligibility_questions`.
- [ ] Store answers in `eligibility_responses`.
- [ ] Write backend function to run eligibility → generate recommendations.
- [ ] Promote recommendations into `company_regulations`.
- [ ] Show user their assigned regulations on completion.

---

## Milestone 2 – Dashboard & Analytics (Next Focus)

- [ ] Implement dashboard layout (cards + charts).
- [ ] Display assigned regulations with % completion.
- [ ] Show due dates and statuses (not started, in progress, completed).
- [ ] Hook dashboard visuals to `v_company_regulation_progress`.
- [ ] Add quick actions: resume regulation, start new regulation, view reports.

---

## Milestone 3 – Regulation Forms & Reports

- [ ] Create regulation page with ordered questions (`reg_questions`).
- [ ] Allow save/resume of answers (`user_responses`).
- [ ] Calculate progress in real-time.
- [ ] Submit completed regulation → generate report entry (`reports`).
- [ ] Build reports page: list in-progress + submitted reports.
- [ ] Implement export (PDF).

---

## Milestone 4 – Collaboration & Messaging

- [ ] Add internal company messaging (threads, admin broadcasts).
- [ ] Link optional threads to regulations/reports.
- [ ] Add notifications for new messages.

---

## Milestone 5 – AI Assistant

- [ ] Build chat UI per user.
- [ ] Connect to RAG backend with regulation KB.
- [ ] Store conversations (`chat_sessions`, `chat_messages`).
- [ ] Context-aware answers (active company + regulations).

---

## Milestone 6 – Notifications & Newsletters

- [ ] Implement in-app + email notifications (new regs, deadlines).
- [ ] Build newsletter generator (scheduled job).
- [ ] Add settings for notification preferences.

---

## Milestone 7 – Settings & Admin Tools

- [ ] Company settings: name, sector, employees, etc.
- [ ] Manage team: roles (owner, admin, member).
- [ ] User settings: notifications, profile.

---

## Milestone 8 – Hardening & Future

- [ ] Add tests (frontend, backend, DB).
- [ ] Write SECURITY.md (GDPR, RLS rules).
- [ ] CI/CD pipeline (GitHub Actions).
- [ ] Deploy staging + production environments.
