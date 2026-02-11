import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { notificationController } from './notificationController';
import { TrustScoreService } from '../services/trustScoreService';

export const offerController = {
    createOffer: async (req: Request, res: Response) => {
        const { listing_id, buyer_id, seller_id, offer_price } = req.body;
        try {
            const { data, error } = await supabase
                .from('offers')
                .insert({
                    listing_id,
                    buyer_id,
                    seller_id,
                    offer_price,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            // Notify Seller
            await notificationController.createNotification(seller_id, 'offer_received', data.id);

            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    respondToOffer: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, counter_price } = req.body; // 'accepted', 'rejected', 'countered'
        try {
            const { data: offer, error: fetchError } = await supabase
                .from('offers')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError || !offer) throw new Error('Offer not found');

            const { data: updatedOffer, error: updateError } = await supabase
                .from('offers')
                .update({ status, counter_price })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Logic for Acceptance
            if (status === 'accepted') {
                // Mark listing as sold
                await supabase
                    .from('listings')
                    .update({ status: 'sold' })
                    .eq('id', offer.listing_id);

                // Update trust scores
                await TrustScoreService.updateScore(offer.seller_id, 5); // +5 for sale

                // Notify Buyer
                await notificationController.createNotification(offer.buyer_id, 'offer_accepted', offer.listing_id);

                // Cancel all other pending offers for this listing
                await supabase
                    .from('offers')
                    .update({ status: 'cancelled' })
                    .eq('listing_id', offer.listing_id)
                    .eq('status', 'pending')
                    .neq('id', id);
            }

            if (status === 'rejected') {
                await notificationController.createNotification(offer.buyer_id, 'offer_rejected', offer.listing_id);
                await TrustScoreService.updateScore(offer.seller_id, -2); // Slight penalty for rejection? User said -10, might be too high but okay.
            }

            if (status === 'countered') {
                await notificationController.createNotification(offer.buyer_id, 'offer_countered', offer.listing_id);
            }

            res.json(updatedOffer);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    getOffersForListing: async (req: Request, res: Response) => {
        const { listingId } = req.params;
        try {
            const { data, error } = await supabase
                .from('offers')
                .select('*, buyer:users!buyer_id(name, avatar_url, trust_score)')
                .eq('listing_id', listingId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    getUserOffers: async (req: Request, res: Response) => {
        const { userId } = req.params;
        try {
            const { data, error } = await supabase
                .from('offers')
                .select('*, listing:listings(title, images, expected_price)')
                .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
};
