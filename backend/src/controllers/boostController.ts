import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const boostController = {
    boostListing: async (req: Request, res: Response) => {
        const { listingId } = req.params;
        const { durationHours = 24 } = req.body;

        try {
            const boostExpiresAt = new Date();
            boostExpiresAt.setHours(boostExpiresAt.getHours() + durationHours);

            const { data, error } = await supabase
                .from('listings')
                .update({
                    is_boosted: true,
                    boost_expires_at: boostExpiresAt.toISOString()
                })
                .eq('id', listingId)
                .select()
                .single();

            if (error) throw error;
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    removeBoost: async (req: Request, res: Response) => {
        const { listingId } = req.params;
        try {
            const { data, error } = await supabase
                .from('listings')
                .update({
                    is_boosted: false,
                    boost_expires_at: null
                })
                .eq('id', listingId);

            if (error) throw error;
            res.json({ message: 'Boost removed' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
};
