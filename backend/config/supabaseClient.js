const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

const isValidUrl = (url) => {
  try {
    return url && url.startsWith('http');
  } catch (e) {
    return false;
  }
};

if (!isValidUrl(supabaseUrl) || !supabaseKey) {
  console.error('\n\x1b[31m%s\x1b[0m', '---------------------------------------------------');
  console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Supabase Credentials Missing/Invalid');
  console.error('\x1b[31m%s\x1b[0m', '---------------------------------------------------');
  console.error('The backend cannot connect to Supabase.');
  console.error('Please open "backend/.env" and set:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\x1b[33m%s\x1b[0m', 'Server will start in "Offline Mode" (API calls will fail).');
  console.error('\x1b[31m%s\x1b[0m', '---------------------------------------------------\n');

  // Dummy client to prevent server crash
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          limit: () => ({ data: [], error: { message: 'Supabase not connected' } }),
          single: () => ({ data: null, error: { message: 'Supabase not connected' } }),
          order: () => ({ limit: () => ({ data: [], error: { message: 'Supabase not connected' } }) })
        }),
        insert: () => ({ select: () => ({ data: null, error: { message: 'Supabase not connected' } }) }),
        update: () => ({ eq: () => ({ error: { message: 'Supabase not connected' } }) }),
        delete: () => ({ eq: () => ({ error: { message: 'Supabase not connected' } }) }),
      }),
      rpc: () => ({ error: { message: 'Supabase not connected' } })
    }),
    storage: {
      from: () => ({
        upload: () => ({ error: { message: 'Supabase not connected' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = supabase;
