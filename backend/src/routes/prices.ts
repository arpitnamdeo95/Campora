import expressKeys, { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { priceEngine } from '../services/aiPricing';

const router = expressKeys.Router();

// Get Price Suggestion
router.post('/suggest', async (req: Request, res: Response) => {
    try {
        const { title, category, condition, expected_price } = req.body;

        // Validate
        if (!title || !category) {
            return res.status(400).json({ error: 'Title and Category required' });
        }

        const priceData = await priceEngine.calculate(
            title,
            category,
            condition,
            expected_price || 0
        );

        res.json(priceData);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
