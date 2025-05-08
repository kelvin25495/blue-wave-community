
import { createClient } from "@supabase/supabase-js";

// Get environment variables or use placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-supabase-project-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

// Log a warning if environment variables are missing
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error("Supabase URL or Anon Key is missing. Using placeholder values which won't work correctly. Please check your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
