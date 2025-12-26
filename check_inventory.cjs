const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInventory() {
    console.log("Checking unit_groups...");
    const { data: groups, error: errorGroups } = await supabase.from('unit_groups').select('*').limit(1);
    console.log("Groups Result:", groups ? 'Found' : 'Null', errorGroups ? errorGroups.message : 'No Error');
    if (groups && groups.length > 0) console.log("Sample Group:", groups[0]);

    console.log("Checking units...");
    const { data: units, error: errorUnits } = await supabase.from('units').select('*').limit(1);
    console.log("Units Result:", units ? 'Found' : 'Null', errorUnits ? errorUnits.message : 'No Error');
    if (units && units.length > 0) console.log("Sample Unit:", units[0]);
}

checkInventory();
