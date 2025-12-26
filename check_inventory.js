import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

async function checkInventory() {
    console.log("Checking units keys...");
    const { data: units, error } = await supabase.from('units').select('*').limit(1);
    if (units && units.length > 0) {
        console.log("Unit Keys:", Object.keys(units[0]));
    } else {
        console.log("No units found or error:", error);
    }
}

checkInventory();
