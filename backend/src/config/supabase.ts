import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase URL or Key missing in .env! Backend logic may fail.');
}

// Service Role Client (Admin Access)
export const supabase = createClient(supabaseUrl, supabaseKey);
