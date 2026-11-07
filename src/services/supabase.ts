import { createClient } from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Only a browser-safe publishable key belongs here. Privileged keys stay on the server.
export const supabase = url && key ? createClient(url,key) : null;
