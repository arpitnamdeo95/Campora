import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const notificationController = {
    getNotifications: async (req: Request, res: Response) => {
        const { userId } = req.params;
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    markAsRead: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            res.json({ message: 'Notification marked as read' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    createNotification: async (userId: string, type: string, referenceId?: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type,
                    reference_id: referenceId,
                    is_read: false
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Failed to create notification:', error);
            return false;
        }
    }
};
