
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://equzrxusbltszzzvbawg.supabase.co';
const supabaseAnonKey = 'sb_publishable_3JxLSXwgOApxXTLl5jcRkg_BvaNXdXg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
