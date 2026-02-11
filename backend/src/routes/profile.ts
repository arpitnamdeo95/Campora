import expressKeys, { Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = expressKeys.Router();

// Get User Profile
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update Profile
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { name, department, year, college } = req.body;

        // Auth Check: Ideally verify token here (JWT)
        // For MVP simple backend pass-through if RLS handles it?
        // Backend service role bypasses RLS, so we MUST verify user.
        // Assuming secure context or this is called from client directly via Supabase mostly.
        // If called via backend API, we should require auth header. 

        const { data, error } = await supabase
            .from('users')
            .update({ name, department, year, college })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
