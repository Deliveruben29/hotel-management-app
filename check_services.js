import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple env loader
try {
    const envPath = resolve(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.log('Could not load local .env file', e.message);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Querying services table...');
    const { data, error } = await supabase
        .from('services')
        .select('*');

    if (error) {
        console.error('Error querying services:', error.message);
        // This confirms connection works but table/query failed
        process.exit(0); // Exit 0 so I can read the output, but log error
    } else {
        console.log('Success! Found', data.length, 'services:');
        data.forEach(s => console.log(`- ${s.name} (${s.price} CHF)`));
        process.exit(0);
    }
}

check();
