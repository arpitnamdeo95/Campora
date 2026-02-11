import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { priceEngine } from '../services/aiPricing';

const router = express.Router();

// Get All with Filters
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, condition, minPrice, maxPrice, sort, search } = req.query;

        let query = supabase
            .from('listings')
            .select('*, users(name, rating, college, trust_score, avatar_url)')
            .eq('status', 'available');

        // Filtering
        if (category) query = query.eq('category', category);
        if (condition) query = query.eq('condition', condition);
        if (minPrice) query = query.gte('expected_price', minPrice);
        if (maxPrice) query = query.lte('expected_price', maxPrice);

        // Search (Very basic ilike)
        if (search) {
            query = query.ilike('title', `%${search}%`);

            // Demand Tracking (Async Log)
            // We don't await this to keep search fast
            logSearch(String(search));
        }

        // Default Order: Boosted first, then newest
        query = query.order('is_boosted', { ascending: false });

        // Sort
        if (sort === 'price_asc') query = query.order('expected_price', { ascending: true });
        else if (sort === 'price_desc') query = query.order('expected_price', { ascending: false });
        else if (sort === 'demand_desc') query = query.order('demand_score', { ascending: false });
        else query = query.order('created_at', { ascending: false }); // Newest

        const { data, error } = await query;
        if (error) throw error;

        res.json(data);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create Listing (Requires Auth check - Frontend handles Auth token via RLS usually, 
// strictly Backend creation allows specific logic like AI verify)
router.post('/', async (req: Request, res: Response) => {
    console.log('📦 Create Listing Request:', req.body);
    try {
        const { title, description, category, condition, expected_price, images, user_id } = req.body;

        // AI Check (Store Recommended Price for validation later)
        const pricing = await priceEngine.calculate(title, category, condition, expected_price);

        const { data, error } = await supabase
            .from('listings')
            .insert([
                {
                    title,
                    description, // optional
                    category,
                    condition,
                    expected_price,
                    ai_price: pricing.recommended,
                    images, // array of urls
                    user_id,
                    college_id: 'default', // future multitenancy logic
                    demand_score: 0,
                    status: 'available'
                }
            ])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Listing
router.get('/:id', async (req: Request, res: Response) => {
    try {
        // Increment specific demand
        // We increment demand score on view asynchronously
        incrementView(req.params.id);

        const { data, error } = await supabase
            .from('listings')
            .select('*, users(*)')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Helper: Log Search
async function logSearch(keyword: string) {
    try {
        await supabase.from('search_logs').insert([{ keyword }]);
    } catch (e) {
        console.error('Log failure', e);
    }
}

// Helper: Increment View (Demand Score)
async function incrementView(id: string) {
    try {
        const { error } = await supabase.rpc('increment_demand', { listing_id: id });
        if (error) console.error('Increment failure', error);
    } catch (e) {
        console.error('Increment failure', e);
    }
}

export default router;
