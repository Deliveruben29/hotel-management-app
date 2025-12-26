import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
config({ path: resolve(__dirname, '.env') });
// Also check parent dir for .env just in case
config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking reservations table...');
    const { count, error } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error.message); // Likely "relation does not exist"
        process.exit(1);
    } else {
        console.log('Success. Table exists.');
        process.exit(0);
    }
}

check();
