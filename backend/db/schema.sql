-- Enable Extensions
create extension if not exists "uuid-ossp";

-- USERS (Profile Sync with Auth)
create table if not exists public.users (
  id uuid references auth.users(id) not null primary key,
  email text unique not null,
  name text,
  college text,
  department text,
  year text,
  rating float default 5.0,
  avatar_url text,
  is_verified_student boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safely add 'is_verified_student' if missing (For existing DBs)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'is_verified_student') then
    alter table public.users add column is_verified_student boolean default false;
  end if;
end;
$$;

-- RLS Users (Safe Re-enable)
alter table public.users enable row level security;

-- Drop exist policies to avoid conflict when re-running
drop policy if exists "Public Profile Access" on public.users;
drop policy if exists "User Edit Own Profile" on public.users;
drop policy if exists "User Insert Own Profile" on public.users;

create policy "Public Profile Access" on public.users for select using (true);
create policy "User Edit Own Profile" on public.users for update using (auth.uid() = id);
create policy "User Insert Own Profile" on public.users for insert with check (auth.uid() = id);

-- LISTINGS
create table if not exists public.listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  college_id text, 
  title text not null,
  description text,
  category text check (category in ('Books', 'Notes', 'Electronics', 'Furniture', 'Other')),
  condition text check (condition in ('New', 'Like New', 'Used', 'Damaged')),
  expected_price numeric not null,
  ai_price numeric, 
  status text default 'available' check (status in ('available', 'sold', 'archived')),
  demand_score int default 0,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Listings
alter table public.listings enable row level security;

drop policy if exists "Public Watch Access" on public.listings;
drop policy if exists "User Edit Own Listings" on public.listings;
drop policy if exists "User Delete Own Listings" on public.listings;
drop policy if exists "User Insert Own Listings" on public.listings;

create policy "Public Watch Access" on public.listings for select using (status = 'available');
create policy "User Edit Own Listings" on public.listings for update using (auth.uid() = user_id);
create policy "User Delete Own Listings" on public.listings for delete using (auth.uid() = user_id);
create policy "User Insert Own Listings" on public.listings for insert with check (auth.uid() = user_id);

-- MESSAGES (Realtime Chat)
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) not null,
  sender_id uuid references public.users(id) not null,
  receiver_id uuid references public.users(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Messages
alter table public.messages enable row level security;

drop policy if exists "View Own Messages" on public.messages;
drop policy if exists "Send Messages" on public.messages;

create policy "View Own Messages" on public.messages for select 
using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Send Messages" on public.messages for insert 
with check (auth.uid() = sender_id);

-- SEARCH LOGS (For AI Demand Tracking)
create table if not exists public.search_logs (
  id uuid default uuid_generate_v4() primary key,
  keyword text,
  college_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- RLS Search Logs
alter table public.search_logs enable row level security;

drop policy if exists "Auth Insert Log" on public.search_logs;
drop policy if exists "Service Role Select Log" on public.search_logs;

create policy "Auth Insert Log" on public.search_logs for insert with check (auth.role() = 'authenticated');
create policy "Service Role Select Log" on public.search_logs for select to service_role using (true);

-- RATINGS (Seller Reputation)
create table if not exists public.ratings (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id),
  buyer_id uuid references public.users(id),
  seller_id uuid references public.users(id),
  score int check (score >= 1 and score <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Ratings
alter table public.ratings enable row level security;

drop policy if exists "Public View Ratings" on public.ratings;
drop policy if exists "Buyer Rate Seller" on public.ratings;

create policy "Public View Ratings" on public.ratings for select using (true);
create policy "Buyer Rate Seller" on public.ratings for insert with check (auth.uid() = buyer_id);

-- FUNCTIONS
-- 1. Increment Demand
create or replace function increment_demand(listing_id uuid)
returns void as $$
begin
  update public.listings
  set demand_score = demand_score + 1
  where id = listing_id;
end;
$$ language plpgsql security definer;

-- 2. Update Seller Rating Trigger
create or replace function update_seller_rating()
returns trigger as $$
begin
  update public.users
  set rating = (select avg(score) from public.ratings where seller_id = new.seller_id)
  where id = new.seller_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_rating_added on public.ratings;
create trigger on_rating_added
after insert on public.ratings
for each row execute procedure update_seller_rating();

-- REALTIME
-- Check if publication exists before creating (Postgres doesn't support IF NOT EXISTS for publications directly in all versions, 
-- but alter publication add table is idempotent if table is already in it usually, or we can ignore error)
-- simpler approach: drop and recreate or just specific add table commands which might fail but are safe to ignore if table already added.
-- Let's stick to simple add. If it fails, it means it's already there.

-- REALTIME SAFE ADD
do $$
begin
  -- Create publication if it doesn't exist
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  -- Add messages if not present
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;

  -- Add listings if not present
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'listings') then
    alter publication supabase_realtime add table public.listings;
  end if;
end;
$$;

-- BUCKETS (If creating manually via SQL, otherwise verify via Dashboard)
-- insert into storage.buckets (id, name, public) values ('listings', 'listings', true);
-- Policies for Storage (as defined previously)
