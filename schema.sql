-- 1. Create Tables

-- Profiles (Public user data)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  system_role text check (system_role in ('user', 'admin')) default 'user',
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Organizations
create table organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  
  -- Billing & Subscription
  billing_email text,
  stripe_customer_id text,
  subscription_plan text default 'free',
  subscription_status text default 'active',
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Memberships (Link Users <-> Orgs)
create table memberships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  org_id uuid references organizations(id) on delete cascade not null,
  role text check (role in ('owner', 'admin', 'member')) default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(user_id, org_id)
);

-- Invitations (For adding new members)
create table invitations (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  email text not null,
  role text check (role in ('owner', 'admin', 'member')) default 'member',
  token text unique not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(org_id, email)
);

-- API Keys (For programmatic access)
create table api_keys (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  key_hash text unique not null,
  label text,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table memberships enable row level security;
alter table invitations enable row level security;
alter table api_keys enable row level security;

-- 3. Define Policies

-- Profiles Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "System Admins can update any profile."
  on profiles for update
  using ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and system_role = 'admin'
    )
  );

-- Organizations Policies
create policy "Organizations are viewable by members."
  on organizations for select
  using (
    exists (
      select 1 from memberships
      where memberships.org_id = organizations.id
      and memberships.user_id = auth.uid()
    )
  );

create policy "Organizations are updatable by owners and admins."
  on organizations for update
  using (
    exists (
      select 1 from memberships
      where memberships.org_id = organizations.id
      and memberships.user_id = auth.uid()
      and memberships.role in ('owner', 'admin')
    )
  );

-- Memberships Policies
create policy "Memberships are viewable by the user or org members."
  on memberships for select
  using (
    auth.uid() = user_id OR 
    exists (
      select 1 from memberships m
      where m.org_id = memberships.org_id
      and m.user_id = auth.uid()
    )
  );

-- Invitations Policies
create policy "Invitations viewable by org admins."
  on invitations for select
  using (
    exists (
      select 1 from memberships
      where memberships.org_id = invitations.org_id
      and memberships.user_id = auth.uid()
      and memberships.role in ('owner', 'admin')
    )
  );

-- API Keys Policies
create policy "API Keys viewable by org admins."
  on api_keys for select
  using (
    exists (
      select 1 from memberships
      where memberships.org_id = api_keys.org_id
      and memberships.user_id = auth.uid()
      and memberships.role in ('owner', 'admin')
    )
  );

-- 4. Triggers

-- Handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
