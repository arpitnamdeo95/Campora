-- Phase 2.5 Database Migrations
-- Add new fields for enhanced marketplace features

-- 1. Add view_count to listings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 2. Add sold_at timestamp to track when item was sold
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'sold_at'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN sold_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 3. Add sold_price to track actual selling price
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'sold_price'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN sold_price NUMERIC;
  END IF;
END $$;

-- 3.5. Add updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
END $$;

-- 4. Create listing_views table to track unique views
CREATE TABLE IF NOT EXISTS public.listing_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(listing_id, user_id, session_id)
);

-- RLS for listing_views
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view listing views" ON public.listing_views;
DROP POLICY IF EXISTS "Authenticated users can insert views" ON public.listing_views;

CREATE POLICY "Anyone can view listing views" ON public.listing_views FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert views" ON public.listing_views FOR INSERT WITH CHECK (true);

-- 5. Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_view_count(p_listing_id UUID, p_user_id UUID, p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Insert view record (will fail silently if duplicate due to UNIQUE constraint)
  INSERT INTO public.listing_views (listing_id, user_id, session_id)
  VALUES (p_listing_id, p_user_id, p_session_id)
  ON CONFLICT (listing_id, user_id, session_id) DO NOTHING;
  
  -- Update view count
  UPDATE public.listings
  SET view_count = (SELECT COUNT(*) FROM public.listing_views WHERE listing_id = p_listing_id)
  WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to calculate seller response time
CREATE OR REPLACE FUNCTION get_seller_response_time(p_seller_id UUID)
RETURNS INTERVAL AS $$
DECLARE
  avg_response_time INTERVAL;
BEGIN
  -- Calculate average time between buyer message and seller response
  SELECT AVG(
    m2.created_at - m1.created_at
  ) INTO avg_response_time
  FROM public.messages m1
  JOIN public.messages m2 ON m1.listing_id = m2.listing_id
  WHERE m1.receiver_id = p_seller_id
    AND m2.sender_id = p_seller_id
    AND m2.created_at > m1.created_at
    AND m2.created_at - m1.created_at < INTERVAL '24 hours'; -- Only count responses within 24h
  
  RETURN COALESCE(avg_response_time, INTERVAL '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to get price insights for a listing
CREATE OR REPLACE FUNCTION get_price_insights(p_listing_id UUID)
RETURNS TABLE (
  average_price NUMERIC,
  price_difference_percent NUMERIC,
  similar_items_count INTEGER,
  views_this_week INTEGER
) AS $$
DECLARE
  current_listing RECORD;
BEGIN
  -- Get current listing details
  SELECT * INTO current_listing FROM public.listings WHERE id = p_listing_id;
  
  RETURN QUERY
  SELECT 
    COALESCE(AVG(l.expected_price), 0)::NUMERIC as average_price,
    CASE 
      WHEN AVG(l.expected_price) > 0 THEN 
        ((current_listing.expected_price - AVG(l.expected_price)) / AVG(l.expected_price) * 100)::NUMERIC
      ELSE 0
    END as price_difference_percent,
    COUNT(*)::INTEGER as similar_items_count,
    (SELECT COUNT(*)::INTEGER FROM public.listing_views 
     WHERE listing_id = p_listing_id 
     AND created_at > NOW() - INTERVAL '7 days') as views_this_week
  FROM public.listings l
  WHERE l.category = current_listing.category
    AND l.id != p_listing_id
    AND l.status = 'available'
    AND l.created_at > NOW() - INTERVAL '90 days'; -- Only consider recent listings
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Update RLS policy for listings to allow viewing sold items
DROP POLICY IF EXISTS "Public Watch Access" ON public.listings;
CREATE POLICY "Public Watch Access" ON public.listings 
FOR SELECT USING (status IN ('available', 'sold'));

-- 9. Create index for performance
CREATE INDEX IF NOT EXISTS idx_listings_status_updated ON public.listings(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON public.listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_created ON public.messages(receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ratings_seller_id ON public.ratings(seller_id);



-- 11. Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
