-- Phase 4 schema: run once in the Supabase project's SQL editor.
--
-- Two tables, deliberately not foreign-keyed to each other:
-- assessment_results is anonymised analytics (no PII); leads is the PII
-- table (email). A POPIA deletion request only ever needs to remove a row
-- from `leads`, leaving anonymised analytics in `assessment_results` intact.

create table if not exists assessment_results (
  session_id text primary key,
  rule_version text not null,
  answers jsonb not null,
  result jsonb not null,
  computed_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  email text not null,
  consent_given_at timestamptz not null default now(),
  kit_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leads_session_id_idx on leads (session_id);

alter table assessment_results enable row level security;
alter table leads enable row level security;
-- No policies defined: only the service-role key (used server-side only,
-- see lib/supabase.ts) can read/write; it bypasses RLS by design. Neither
-- table is ever reachable from the anon/browser key.
