import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// Define the admin email
export const ADMIN_EMAIL = "4425@admin.com";

// Define admin session type
interface AdminSession {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  adminSession: AdminSession | null;
  signOut: () => Promise<void>;
  setAdminSession: (session: AdminSession | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const { toast } = useToast();

  // This effect runs on initial load to set up authentication state
  useEffect(() => {
    // Check for stored admin session on initial load
    try {
      const storedAdminSession = localStorage.getItem("adminSession");
      if (storedAdminSession) {
        const parsedSession = JSON.parse(storedAdminSession);
        setAdminSession(parsedSession);
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error loading stored admin session:", error);
    }

    const fetchSession = async () => {
      try {
        console.log("Fetching initial session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          setSession(null);
          setUser(null);
          return;
        }
        
        if (data.session) {
          console.log("Session found:", data.session.user.email);
          setSession(data.session);
          setUser(data.session.user);
          
          // Check if user is admin by email
          if (data.session.user.email === ADMIN_EMAIL) {
            console.log("Admin user detected by email");
            setIsAdmin(true);
          } else {
            try {
              // Check if user is admin by profile in database
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", data.session.user.id)
                .single();
                
              if (profileError) {
                console.warn("Error fetching admin status:", profileError);
              } else {
                console.log("Profile data for admin check:", profileData);
                if (profileData?.is_admin) {
                  setIsAdmin(true);
                }
              }
            } catch (profileError) {
              console.warn("Could not fetch admin status:", profileError);
            }
          }
        } else {
          console.log("No active session found");
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Unexpected error fetching session:", error);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Set up the auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Always set loading to true during auth changes
        setIsLoading(true);
        
        if (newSession?.user) {
          console.log("New session user:", newSession.user.email);
          
          // Check if user is admin by email
          if (newSession.user.email === ADMIN_EMAIL) {
            console.log("Admin user detected by email");
            setIsAdmin(true);
          } else {
            try {
              // Check if user is admin by profile
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", newSession.user.id)
                .single();
                
              if (profileError) {
                console.warn("Error fetching admin status on auth change:", profileError);
              } else {
                console.log("Profile data for admin check:", profileData);
                if (profileData?.is_admin) {
                  setIsAdmin(true);
                }
              }
            } catch (profileError) {
              console.warn("Could not fetch admin status on auth change:", profileError);
            }
          }
        } else {
          console.log("No user in new session");
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      console.log("Cleaning up auth listener");
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Function to sign out the user
  const signOut = async () => {
    console.log("Attempting to sign out");
    setIsLoading(true);
    
    try {
      // If admin session exists, clear it
      if (adminSession) {
        localStorage.removeItem("adminSession");
        setAdminSession(null);
        setIsAdmin(false);
        
        console.log("Admin signed out");
        
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
        
        setIsLoading(false);
        return;
      }
      
      // Otherwise, handle regular user sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast({
          title: "Error",
          description: "Failed to sign out: " + error.message,
          variant: "destructive",
        });
      } else {
        console.log("Successfully signed out");
        // Clear local state
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
      }
    } catch (error: any) {
      console.error("Unexpected error signing out:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while signing out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoading, 
      isAdmin, 
      adminSession,
      signOut, 
      setAdminSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
