import { createClient } from '@supabase/supabase-js';

// TEMP DEBUG: Hardcoded credentials to verify connection
const supabaseUrl = 'https://zhiwomwnretkjksvgbcg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoaXdvbXducmV0a2prc3ZnYmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MDczMjYsImV4cCI6MjA4MjI4MzMyNn0.eYDnfxijg976b4iZgCEP6BvSaLQXxyojZ0gXfsk_2io';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

