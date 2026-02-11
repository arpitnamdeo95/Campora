import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const wishlistController = {
    toggleWishlist: async (req: Request, res: Response) => {
        const { user_id, listing_id } = req.body;
        try {
            // Check if already exists
            const { data: existing } = await supabase
                .from('wishlists')
                .select('*')
                .eq('user_id', user_id)
                .eq('listing_id', listing_id)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('wishlists')
                    .delete()
                    .eq('id', existing.id);
                if (error) throw error;
                return res.json({ status: 'removed' });
            } else {
                const { error } = await supabase
                    .from('wishlists')
                    .insert({ user_id, listing_id });
                if (error) throw error;
                return res.json({ status: 'added' });
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    getWishlist: async (req: Request, res: Response) => {
        const { userId } = req.params;
        try {
            const { data, error } = await supabase
                .from('wishlists')
                .select('*, listings(*)')
                .eq('user_id', userId);

            if (error) throw error;
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
};
