import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfrtcapcyigcjwesukcb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcnRjYXBjeWlnY2p3ZXN1a2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDY0MTIsImV4cCI6MjA3MDg4MjQxMn0.i14Y4lSlFxLl5Q-FgmYmGv99ju-27P2nIq55jtr9M90';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);