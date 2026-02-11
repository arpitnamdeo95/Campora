-- SUPER FIX SCRIPT (Run ALL of this in SQL Editor)

-- 1. Safely Add Missing Columns
do $$
begin
    -- avatar_url
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'avatar_url') then
        alter table public.users add column avatar_url text;
    end if;
    -- college
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'college') then
        alter table public.users add column college text;
    end if;
     -- name
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'name') then
        alter table public.users add column name text;
    end if;
     -- is_verified_student
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'is_verified_student') then
        alter table public.users add column is_verified_student boolean default false;
    end if;
end $$;

-- 2. Update Sync Function (Bulletproof)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, college, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'Student'),
    coalesce(new.raw_user_meta_data->>'college', 'Campus'),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Re-Attach Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. FORCE BACKFILL (Fix Your Current User)
insert into public.users (id, email, name, college, avatar_url)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'name', 'Student'), 
  coalesce(raw_user_meta_data->>'college', 'Campus'), 
  coalesce(raw_user_meta_data->>'avatar_url', '')
from auth.users
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  avatar_url = excluded.avatar_url;
