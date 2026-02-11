import { supabase } from '../config/supabase';

// AI Price Suggestion Service
class PriceEngineService {
    /**
     * Calculates a recommended price based on similar market listings and demand tracking.
     * Logic:
     * 1. Fetch listings with same title keywords (simplified text search)
     * 2. Calculate average (baseline)
     * 3. Apply Multipliers for Condition (New, Used)
     * 4. Apply Multipliers for Demand (Search volume last 7 days)
     */
    async calculate(title: string, category: string, condition: string, expectedPrice: number) {
        // 1. Fetch Similar (Simplified: Same Category + Text Check)
        const { data: similarListings, error } = await supabase
            .from('listings')
            .select('expected_price, title, condition')
            .eq('category', category)
            .eq('status', 'available') // Only compare active market
            .limit(50);

        if (error) {
            console.error('Price fetch error:', error);
            return this.fallback(expectedPrice);
        }

        // Filter strictly by keyword overlap (basic NLP replacement)
        const keywords = title.toLowerCase().split(' ').filter(w => w.length > 3);
        const relevant = similarListings.filter(l =>
            keywords.some(k => l.title.toLowerCase().includes(k))
        );

        // Initial Baseline
        let baseline = expectedPrice;
        if (relevant.length > 0) {
            const sum = relevant.reduce((acc, curr) => acc + curr.expected_price, 0);
            baseline = sum / relevant.length;
        }

        // Condition Adjustment
        let conditionMultiplier = 0.9; // Default Used
        if (condition === 'New') conditionMultiplier = 1.2;
        if (condition === 'Like New') conditionMultiplier = 1.1;

        // Demand Adjustment (Fetch search logs)
        // For MVP, we use category popularity if no specific search data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count } = await supabase
            .from('search_logs')
            .select('*', { count: 'exact', head: true })
            .ilike('keyword', `%${keywords[0] || category}%`)
            .gte('created_at', sevenDaysAgo.toISOString());

        let demandMultiplier = 1.0;
        const searchVolume = count || 0;

        if (searchVolume > 20) demandMultiplier = 1.15; // High Demand
        else if (searchVolume > 5) demandMultiplier = 1.05; // Modest Demand
        else demandMultiplier = 0.95; // Low Demand

        // Final Calculation
        const recommended = Math.round(baseline * conditionMultiplier * demandMultiplier);

        return {
            recommended: recommended,
            quick_sale: Math.round(recommended * 0.90), // 10% off for speed
            max_value: Math.round(recommended * 1.15),  // 15% markup for patience
            market_data: {
                similar_count: relevant.length,
                demand_level: searchVolume > 20 ? 'High' : (searchVolume > 5 ? 'Medium' : 'Low')
            }
        };
    }

    fallback(price: number) {
        return {
            recommended: price,
            quick_sale: Math.round(price * 0.9),
            max_value: Math.round(price * 1.1),
            market_data: { error: true }
        };
    }
}

export const priceEngine = new PriceEngineService();
