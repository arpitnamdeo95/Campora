const supabase = require('../config/supabaseClient');

/**
 * AI Price Engine Service
 * Implements rule-based logic to suggest fair market prices.
 */
class PriceEngine {

    /**
     * Calculates suggested prices based on market data and item condition.
     * @param {Object} itemDetails - { title, category, condition, expected_price }
     * @returns {Object} - { recommended, quick_sale, max_value, demand_level }
     */
    async calculatePrice(itemDetails) {
        const { title, category, condition, expected_price } = itemDetails;

        try {
            // 1. Fetch Baseline Market Data (Similar Items)
            // We look for items in the same category. Ideally, we'd filter by title similarity in DB,
            // but simpler to fetch latest 50 in category and filter in memory for MVP.
            const { data: listings, error } = await supabase
                .from('listings')
                .select('expected_price, title, condition')
                .eq('category', category)
                .eq('status', 'available')
                .order('created_at', { ascending: false })
                .limit(50); // Analyze last 50 listings

            if (error) {
                console.error('Error fetching market data:', error);
                return this.fallbackPrice(expected_price);
            }

            // 2. Identify "Relevant" Listings (Simple Keyword Match)
            // If title shares >1 significant word (len > 3)
            const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);

            const relevantListings = listings.filter(l => {
                const lWords = l.title.toLowerCase().split(/\s+/);
                // Count matching words
                const matches = titleWords.filter(w => lWords.includes(w)).length;
                return matches >= 1;
            });

            // 3. Calculate Baseline Price (Average of relevant listings)
            let baselinePrice = 0;
            if (relevantListings.length > 0) {
                const total = relevantListings.reduce((sum, item) => sum + item.expected_price, 0);
                baselinePrice = total / relevantListings.length;
            } else {
                // If no market data, trust the user's input or set a default logic
                // For MVP, if no similar items exist, we rely on user's input as the "market start"
                // potentially with a conservative adjustment.
                baselinePrice = parseFloat(expected_price) || 0;
            }

            // 4. Apply Condition Multiplier
            // Condition Logic: New (+20%), Like New (+10%), Used (-10%)
            // Base: Used (matches most student items)
            let conditionMultiplier = 0.9; // Default 'Used'
            if (condition === 'New') conditionMultiplier = 1.2;
            else if (condition === 'Like New') conditionMultiplier = 1.1;

            let priceAfterCondition = baselinePrice * conditionMultiplier;

            // 5. Apply Demand Factor
            // Check search frequency for related keywords in last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // We verify demand by checking search logs for the category or title keywords
            // Simply counting searches for the category is a good proxy for "Category Demand"
            // Counting searches for specific title is better "Item Demand"

            // Let's try finding exact keyword matches first
            // Using .or() to match any of the significant keywords if possible
            // or just counting category searches if keywords are too specific is safer for MVP.
            // Let's use Category Demand as a baseline proxy + Keyword boost.

            // Simply: Count searches containing the first significant keyword.
            const mainKeyword = titleWords[0] || category; // Fallback to category name

            const { count: searchCount, error: demandError } = await supabase
                .from('search_logs')
                .select('*', { count: 'exact', head: true })
                .ilike('keyword', `%${mainKeyword}%`)
                .gte('created_at', sevenDaysAgo.toISOString());

            let demandMultiplier = 1.0;
            const searches = searchCount || 0;

            if (searches > 10) {
                demandMultiplier = 1.10; // High demand -> +10%
            } else if (searches < 3) {
                demandMultiplier = 0.95; // Low demand -> -5%
            }

            // 6. Final Calculation
            let finalPrice = priceAfterCondition * demandMultiplier;

            // Ensure we don't return 0 if something failed, fallback to user input
            if (finalPrice <= 0) finalPrice = parseFloat(expected_price) || 0;

            return {
                recommended: Math.round(finalPrice),
                quick_sale: Math.round(finalPrice * 0.95), // 5% cheaper
                max_value: Math.round(finalPrice * 1.10),  // 10% higher
                details: {
                    market_data_points: relevantListings.length,
                    demand_score: searches > 10 ? 'High' : (searches < 3 ? 'Low' : 'Medium'),
                    condition_adjustment: `${(conditionMultiplier - 1) * 100}%`
                }
            };

        } catch (err) {
            console.error('Price Engine Critical Error:', err);
            // Fail Safe
            return this.fallbackPrice(expected_price);
        }
    }

    fallbackPrice(price) {
        const p = parseFloat(price) || 0;
        return {
            recommended: p,
            quick_sale: Math.round(p * 0.95),
            max_value: Math.round(p * 1.10),
            details: { note: 'Analysis unavailable, using input price' }
        };
    }
}

module.exports = new PriceEngine();
