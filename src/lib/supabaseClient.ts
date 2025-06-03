
import { createClient } from "@supabase/supabase-js";

// Get environment variables or use provided values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yuqzcwmyuxbctrcjykln.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cXpjd215dXhiY3RyY2p5a2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MDQ2MzgsImV4cCI6MjA2MjI4MDYzOH0.9VEiRv6cIURGHqen87iodh_50IEgTcsxhtbTPISoTwA";

// Validate the configuration
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key (first 20 chars):", supabaseAnonKey.substring(0, 20) + "...");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration");
  throw new Error("Missing Supabase URL or anon key");
}

// Test if the URL is reachable
console.log("Initializing Supabase client...");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase connection test failed:", error);
  } else {
    console.log("Supabase connection test successful");
  }
}).catch((err) => {
  console.error("Failed to test Supabase connection:", err);
});
