
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

// Test URL accessibility
const testSupabaseConnection = async () => {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });
    
    console.log("Supabase connection test response status:", response.status);
    
    if (!response.ok) {
      console.error("Supabase connection test failed with status:", response.status);
      return false;
    }
    
    console.log("Supabase connection test successful");
    return true;
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return false;
  }
};

// Test connection on initialization
testSupabaseConnection();

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

// Helper function to check if we can reach Supabase
export const checkSupabaseConnection = async () => {
  return await testSupabaseConnection();
};
