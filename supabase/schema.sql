-- ============================================
-- UNWIND BRANDGUARD
-- MILESTONE 2: WORKSPACE AND GUIDELINES
-- ============================================

create extension if not exists pgcrypto;

-- 1. WORKSPACES
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. WORKSPACE MEMBERS
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor'
    check (role in ('owner', 'admin', 'editor', 'reviewer', 'viewer')),
  joined_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

-- 3. BRAND GUIDELINES
create table if not exists public.brand_guidelines (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  category text not null check (
    category in (
      'voice_tone',
      'terminology',
      'approved_fact',
      'prohibited_claim',
      'accessibility',
      'visual_identity',
      'other'
    )
  ),
  content text not null,
  source_reference text,
  status text not null default 'active'
    check (status in ('active', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workspace_members_user
  on public.workspace_members(user_id);

create index if not exists idx_guidelines_workspace
  on public.brand_guidelines(workspace_id);

create index if not exists idx_guidelines_category
  on public.brand_guidelines(workspace_id, category);

-- ============================================
-- ACCESS CONTROL HELPERS
-- SECURITY DEFINER avoids recursive RLS checks
-- ============================================

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_workspace_role(
  target_workspace uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = (select auth.uid())
      and wm.role = any(allowed_roles)
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.has_workspace_role(uuid, text[]) from public;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.has_workspace_role(uuid, text[]) to authenticated;

-- ============================================
-- AUTOMATIC OWNER MEMBERSHIP
-- ============================================

create or replace function public.add_workspace_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspace_members (
    workspace_id,
    user_id,
    role
  )
  values (
    new.id,
    new.owner_id,
    'owner'
  );

  return new;
end;
$$;

drop trigger if exists on_workspace_created
  on public.workspaces;

create trigger on_workspace_created
after insert on public.workspaces
for each row execute function public.add_workspace_owner();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.brand_guidelines enable row level security;

-- WORKSPACES

drop policy if exists "Members can view workspaces"
  on public.workspaces;

create policy "Members can view workspaces"
on public.workspaces
for select to authenticated
using (public.is_workspace_member(id));

drop policy if exists "Authenticated users can create workspaces"
  on public.workspaces;

create policy "Authenticated users can create workspaces"
on public.workspaces
for insert to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "Admins can update workspaces"
  on public.workspaces;

create policy "Admins can update workspaces"
on public.workspaces
for update to authenticated
using (public.has_workspace_role(id, array['owner', 'admin']))
with check (public.has_workspace_role(id, array['owner', 'admin']));

drop policy if exists "Owners can delete workspaces"
  on public.workspaces;

create policy "Owners can delete workspaces"
on public.workspaces
for delete to authenticated
using (owner_id = (select auth.uid()));

-- MEMBERS

drop policy if exists "Members can view workspace members"
  on public.workspace_members;

create policy "Members can view workspace members"
on public.workspace_members
for select to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists "Admins can add workspace members"
  on public.workspace_members;

create policy "Admins can add workspace members"
on public.workspace_members
for insert to authenticated
with check (
  public.has_workspace_role(workspace_id, array['owner', 'admin'])
);

drop policy if exists "Admins can update workspace members"
  on public.workspace_members;

create policy "Admins can update workspace members"
on public.workspace_members
for update to authenticated
using (
  public.has_workspace_role(workspace_id, array['owner', 'admin'])
)
with check (
  public.has_workspace_role(workspace_id, array['owner', 'admin'])
);

drop policy if exists "Admins can remove workspace members"
  on public.workspace_members;

create policy "Admins can remove workspace members"
on public.workspace_members
for delete to authenticated
using (
  public.has_workspace_role(workspace_id, array['owner', 'admin'])
  and user_id <> (select auth.uid())
);

-- GUIDELINES

drop policy if exists "Members can view brand guidelines"
  on public.brand_guidelines;

create policy "Members can view brand guidelines"
on public.brand_guidelines
for select to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists "Editors can create brand guidelines"
  on public.brand_guidelines;

create policy "Editors can create brand guidelines"
on public.brand_guidelines
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'editor']
  )
);

drop policy if exists "Editors can update brand guidelines"
  on public.brand_guidelines;

create policy "Editors can update brand guidelines"
on public.brand_guidelines
for update to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'editor']
  )
)
with check (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'admin', 'editor']
  )
);

drop policy if exists "Admins can delete brand guidelines"
  on public.brand_guidelines;

create policy "Admins can delete brand guidelines"
on public.brand_guidelines
for delete to authenticated
using (
  public.has_workspace_role(
    workspace_id,
    array['owner', 'admin']
  )
);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspaces_updated_at
  on public.workspaces;

create trigger workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

drop trigger if exists guidelines_updated_at
  on public.brand_guidelines;

create trigger guidelines_updated_at
before update on public.brand_guidelines
for each row execute function public.set_updated_at();

-- ============================================
-- TABLE PRIVILEGES
-- ============================================

grant select, insert, update, delete
on public.workspaces to authenticated;

grant select, insert, update, delete
on public.workspace_members to authenticated;

grant select, insert, update, delete
on public.brand_guidelines to authenticated;