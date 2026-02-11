-- 0. FIX SCHEMA
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists college text;
alter table public.users add column if not exists name text;

-- 1. SYNC AUTH USERS TO PUBLIC USERS
-- This function runs every time a user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, college, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'college',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. BACKFILL EXISTING USERS
-- Fixes your current account by copying it from auth.users to public.users
insert into public.users (id, email, name, college, avatar_url)
select 
  id, 
  email, 
  raw_user_meta_data->>'name', 
  raw_user_meta_data->>'college', 
  raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.users);

-- 3. ENSURE STORAGE BUCKET EXISTS & POLICIES
-- Create 'listings' bucket if not exists
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- Allow Public View
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'listings' );

-- Allow Authenticated Uploads (User can only upload to their own folder: user_id/filename)
drop policy if exists "Auth Upload" on storage.objects;
create policy "Auth Upload" on storage.objects for insert 
with check ( bucket_id = 'listings' and auth.role() = 'authenticated' );
