-- Create 'listings' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- Ensure Upload Policy
drop policy if exists "Authenticated Uploads" on storage.objects;
create policy "Authenticated Uploads" on storage.objects for insert to authenticated with check ( bucket_id = 'listings' );

-- Ensure Public Access Policy
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select to public using ( bucket_id = 'listings' );
