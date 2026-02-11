-- WISHLIST TABLE
create table if not exists public.wishlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, listing_id)
);

-- RLS Wishlists
alter table public.wishlists enable row level security;

drop policy if exists "Users can manage own wishlist" on public.wishlists;
create policy "Users can manage own wishlist" on public.wishlists
for all using (auth.uid() = user_id);

-- TRIGGER FOR DEMAND SCORE ON WISHLIST
-- When someone wishlists an item, it counts as high demand
create or replace function public.wishlist_demand()
returns trigger as $$
begin
  update public.listings
  set demand_score = demand_score + 5
  where id = new.listing_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_wishlist_added on public.wishlists;
create trigger on_wishlist_added
after insert on public.wishlists
for each row execute procedure public.wishlist_demand();
