import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// Get User Wishlist
router.get('/', async (req: Request, res: Response) => {
    try {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ error: 'User ID required' });

        const { data, error } = await supabase
            .from('wishlists')
            .select('*, listings(*, users(name, college))')
            .eq('user_id', user_id);

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Add to Wishlist
router.post('/', async (req: Request, res: Response) => {
    try {
        const { user_id, listing_id } = req.body;

        const { data, error } = await supabase
            .from('wishlists')
            .upsert({ user_id, listing_id })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Remove from Wishlist
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Removed from wishlist' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
