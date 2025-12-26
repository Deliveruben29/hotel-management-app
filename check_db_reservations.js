import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envFile = readFileSync(resolve(__dirname, '.env'), 'utf-8');
    const lines = envFile.split('\n');
    for (const line of lines) {
        if (line.startsWith('VITE_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim();
        }
    }
} catch (e) {
    console.error('Error reading .env file:', e);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReservations() {
    console.log('Querying reservations table...');
    const { data, error } = await supabase
        .from('reservations')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('Table is empty.');
    } else {
        console.log(`Found ${data.length} records.`);
        console.log('First Record Keys:', Object.keys(data[0]));
        console.log('First Record Sample:', data[0]);
    }
}

checkReservations();
