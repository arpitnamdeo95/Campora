import { supabase } from '../config/supabase';

export class TrustScoreService {
    /**
     * Update user trust score based on specific actions
     * Formula:
     * - Sale Completed: +5
     * - Positive Rating (4-5): +2
     * - Negative Rating (1-2): -5
     * - Offer Rejected: -10 (Potentially harsh, maybe only if frequent?)
     * - Offer Expired: -2
     */
    static async updateScore(userId: string, change: number) {
        try {
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('trust_score')
                .eq('id', userId)
                .single();

            if (fetchError || !user) throw new Error('User not found');

            const newScore = Math.max(0, Math.min(100, (user.trust_score || 50) + change));

            const { error: updateError } = await supabase
                .from('users')
                .update({ trust_score: newScore })
                .eq('id', userId);

            if (updateError) throw updateError;

            // Trigger notification for trust score update if significant?
            // For now just log
            console.log(`🛡️ Trust Score Updated for ${userId}: ${newScore}`);

            return newScore;
        } catch (error) {
            console.error('Error updating trust score:', error);
            return null;
        }
    }

    static async calculateInitialScore(userId: string) {
        // Implementation for account age bonus (+1 per 7 days)
        // This could be run on a cron job or on login
    }
}
