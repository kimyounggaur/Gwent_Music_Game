create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  client_snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cards jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  kind text not null,
  tier int not null check (tier between 1 and 4),
  correct boolean not null,
  latency_ms int not null default 0,
  concept_tag text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.review_queue (
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_tag text not null,
  ease numeric not null default 2.5,
  interval_days int not null default 0,
  due_at timestamptz not null default now(),
  primary key (user_id, concept_tag)
);

create table if not exists public.campaign_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  stage_id text not null,
  stars int not null default 0 check (stars between 0 and 3),
  updated_at timestamptz not null default now(),
  primary key (user_id, stage_id)
);

alter table public.profiles enable row level security;
alter table public.decks enable row level security;
alter table public.learning_results enable row level security;
alter table public.review_queue enable row level security;
alter table public.campaign_progress enable row level security;

create policy "profiles owner read" on public.profiles for select using (auth.uid() = id);
create policy "profiles owner insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles owner update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "decks owner read" on public.decks for select using (auth.uid() = user_id);
create policy "decks owner insert" on public.decks for insert with check (auth.uid() = user_id);
create policy "decks owner update" on public.decks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "decks owner delete" on public.decks for delete using (auth.uid() = user_id);

create policy "learning owner read" on public.learning_results for select using (auth.uid() = user_id);
create policy "learning owner insert" on public.learning_results for insert with check (auth.uid() = user_id);

create policy "review owner read" on public.review_queue for select using (auth.uid() = user_id);
create policy "review owner insert" on public.review_queue for insert with check (auth.uid() = user_id);
create policy "review owner update" on public.review_queue for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "review owner delete" on public.review_queue for delete using (auth.uid() = user_id);

create policy "campaign owner read" on public.campaign_progress for select using (auth.uid() = user_id);
create policy "campaign owner insert" on public.campaign_progress for insert with check (auth.uid() = user_id);
create policy "campaign owner update" on public.campaign_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
