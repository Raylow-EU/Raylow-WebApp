## All the DB elements

### **1) companies**

- Stores one row per company.
- 1:N with *users* (a company has many users).
- 1:N with *invites* and *company_regulations*.
- 1:N with _eligibility_assessments_.

```sql
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  employees_estimate integer,
  emissions_tons_yearly numeric,
  reg_discovery_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### **2) users (profiles; 1 user → 1 company)**

- Mirrors our app users; id equals *auth.users.id.* Stores basic onboarding info and company role.
- FK *company_id* ties a user to exactly one company.

```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  is_admin boolean not null default false, -- platform-wide admin (separate from company role)
  company_id uuid references public.companies(id) on delete set null,
  company_role text not null default 'member' check (company_role in ('owner','admin','member')),
  onboarding_basic_completed_at timestamptz,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Relationship notes:

- 1:1 with a*uth.users* (same *id*).
- N:1 to *companies* via *company_id.*

### **3) invites (email-based)**

- Admins invite users to their company by email.
- Unique per (_company_id_, _email_) so we don’t duplicate invites.
- Only the user with that email should be able to accept (enforced by policy later).

```sql
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invited_by_user_id uuid not null references public.users(id) on delete set null,
  email text not null,
  role text not null default 'member' check (role in ('owner','admin','member')),
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (company_id, email)
);
```

Relationships:

- N:1 to *companies*.
- N:1 to *users* (the inviter).

### **4) regulations (catalog)**

- Master list of regulations you support.
- 1:N with *reg_questions*.
- N:M with *companies* through *company_regulations*.

```sql
create table public.regulations (
  id uuid primary key default gen_random_uuid(),
  code text,
  jurisdiction text,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);
```

### **5) reg_questions (questions per regulation)**

- Ordered questions for the user/company to fill out for a regulation at hand.
- N:1 to regulations;
- 1:N with user_responses (a question can have many responses over time/users).

```sql
create table public.reg_questions (
  id uuid primary key default gen_random_uuid(),
  regulation_id uuid not null references public.regulations(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'text',
  order_index integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
```

Relationships:

- N:1 to *regulations*.
- 1:N with *user_responses*.

### **6) company_regulations (assignment of regs to a company)**

- Which regulations apply to which company.
- One row per (_company_, _regulation_).
- This willa allow for status, due date, and percent of completion

```sql
create table public.company_regulations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  regulation_id uuid not null references public.regulations(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, regulation_id)
);
```

Relationships:

- N:1 to *companies*.
- N:1 to *regulations*.

### **7) user_responses (answers)**

- Every answer is tied to a user, their company, a regulation, and a question. Currently would keep history by inserting a new row on change. We could see if more optimal way to do this.
- This will allow % progress: latest answers per question are compared to total questions.

```sql
create table public.user_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  regulation_id uuid not null references public.regulations(id) on delete cascade,
  question_id uuid not null references public.reg_questions(id) on delete cascade,
  answer_text text,
  answer_json jsonb,
  answer_score numeric,
  submitted_at timestamptz not null default now()
);
```

Relationships:

- N:1 to *users*, *companies*, *regulations*, *reg_questions*.

How progress works:

- “Percent complete” = answered questions / total questions for that regulation.
- Compute it via a view (next section) so it’s always correct.

```sql
create or replace view public.v_company_regulation_progress as
with q_counts as (
  select regulation_id, count(*) as total_q
  from public.reg_questions
  where active = true
  group by regulation_id
),
latest_answers as (
  select company_id, regulation_id, question_id,
         max(submitted_at) as latest
  from public.user_responses
  group by company_id, regulation_id, question_id
)
select
  cr.company_id,
  cr.regulation_id,
  coalesce(
    100.0 * (
      select count(*) from latest_answers la
      where la.company_id = cr.company_id
        and la.regulation_id = cr.regulation_id
    )::numeric / nullif((select qc.total_q from q_counts qc where qc.regulation_id = cr.regulation_id),0),
  0) as percent_complete
from public.company_regulations cr;
```

### **8) chat_sessions (private to a user)**

- Each session belongs to exactly one user. This setup does not share _chat_sessions_ at the company level.
- 1:N with *chat_messages*

```sql
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Relationships:

- N:1 to *users* (the owner).

### **9) chat_messages**

- Ordered messages inside a session.
- *user_id* is nullable for assistant/system messages.

```sql
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null, -- null for assistant
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_chat_messages_session_created_at
  on public.chat_messages (session_id, created_at);
```

Relationships:

- N:1 to *chat_sessions*.
- Optional N:1 to *users*.
