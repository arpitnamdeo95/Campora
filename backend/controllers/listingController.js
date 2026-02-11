const supabase = require('../config/supabaseClient');
const priceEngine = require('../services/priceEngine');

// Get all listings with filters
exports.getListings = async (req, res) => {
    try {
        const { category, condition, minPrice, maxPrice, sort, search, college } = req.query;

        let query = supabase
            .from('listings')
            .select('*, users(name, rating, college)') // Join user data for display
            .eq('status', 'available');

        // Filters
        if (category) query = query.eq('category', category);
        if (condition) query = query.eq('condition', condition);
        if (college) query = query.eq('college_id', college); // Assuming college_id is stored or filtered by user metadata

        if (minPrice) query = query.gte('expected_price', minPrice);
        if (maxPrice) query = query.lte('expected_price', maxPrice);

        if (search) {
            // Simple search implementation
            query = query.ilike('title', `%${search}%`);

            // Log search for Demand Tracking
            // Async logging (don't block response)
            logSearch(search, college);
        }

        // Sort
        if (sort === 'price_asc') query = query.order('expected_price', { ascending: true });
        else if (sort === 'price_desc') query = query.order('expected_price', { ascending: false });
        else if (sort === 'demand_desc') query = query.order('demand_score', { ascending: false });
        else query = query.order('created_at', { ascending: false }); // Default: Newest

        const { data, error } = await query;

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new listing
exports.createListing = async (req, res) => {
    try {
        const { title, description, category, condition, expected_price, images, user_id, college_id } = req.body;

        // Optional: Calculate AI price if not provided, or verify it
        // For MVP, we trust the frontend sent the AI price or we recalculate it to store it.
        // The prompt says "Return Recommended price", implies frontend asks for it.
        // Let's calculate it here to store the official AI suggestion.
        const pricing = await priceEngine.calculatePrice(title, category, condition, expected_price);

        const { data, error } = await supabase
            .from('listings')
            .insert([
                {
                    title,
                    description,
                    category,
                    condition,
                    expected_price,
                    ai_price: pricing.recommended,
                    images,
                    user_id,
                    college_id,
                    demand_score: 0, // Initial score
                    status: 'available'
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get AI Price Suggestion
exports.suggestPrice = async (req, res) => {
    try {
        const { title, category, condition, expected_price } = req.body;

        if (!title || !category) {
            return res.status(400).json({ error: 'Title and Category are required' });
        }

        const priceData = await priceEngine.calculatePrice(title, category, condition, expected_price);

        res.json(priceData);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Listing Details
exports.getListingById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('listings')
            .select('*, users(*)')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Track detailed view for demand score?
        // "Clicks" -> simple increment
        // Async update
        incrementDemand(id);

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Helper: Log Search
async function logSearch(keyword, college) {
    try {
        await supabase.from('search_logs').insert([{ keyword, college }]);
    } catch (e) {
        console.error('Search log error:', e);
    }
}

// Helper: Increment Demand
async function incrementDemand(listingId) {
    try {
        // We can't do atomic increment easily with JS client without RPC or raw SQL.
        // Use RPC if possible, or fetch-update for MVP (race condition risk but acceptable for MVP stats)

        // Better: create a stored procedure 'increment_demand(listing_id)'
        // For MVP without custom SQL in Setup if avoidable:
        // Just skip or try basic update. I will assume an RPC function exists or skip tracking for now to keep it simple pure JS.
        // Actually, user wants Demand Tracking.
        // Let's try raw rpc call `rpc('increment_demand', { row_id: listingId })` if we define it in SQL.
        // Valid approach: define SQL function in schema setup.
        const { error } = await supabase.rpc('increment_demand', { listing_id: listingId });
        if (error) console.error('Demand update error:', error);
    } catch (e) {
        console.error('Demand update error:', e);
    }
}
