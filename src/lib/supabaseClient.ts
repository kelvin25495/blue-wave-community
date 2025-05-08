
import { createClient } from "@supabase/supabase-js";

// Get environment variables or use provided values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yuqzcwmyuxbctrcjykln.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cXpjd215dXhiY3RyY2p5a2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MDQ2MzgsImV4cCI6MjA2MjI4MDYzOH0.9VEiRv6cIURGHqen87iodh_50IEgTcsxhtbTPISoTwA";

// Still log a warning if environment variables are missing
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.log("Using directly provided Supabase credentials instead of environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
