
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// Define the admin email
export const ADMIN_EMAIL = "admin2025@44.com";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // This effect runs on initial load to set up authentication state
  useEffect(() => {
    const fetchSession = async () => {
      try {
        console.log("Fetching initial session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          setSession(null);
          setUser(null);
          setIsAdmin(false);
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
                setIsAdmin(false);
              } else {
                console.log("Profile data for admin check:", profileData);
                setIsAdmin(profileData?.is_admin || false);
              }
            } catch (profileError) {
              console.warn("Could not fetch admin status:", profileError);
              setIsAdmin(false);
            }
          }
        } else {
          console.log("No active session found");
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Unexpected error fetching session:", error);
        setSession(null);
        setUser(null);
        setIsAdmin(false);
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
                setIsAdmin(false);
              } else {
                console.log("Profile data for admin check:", profileData);
                setIsAdmin(profileData?.is_admin || false);
              }
            } catch (profileError) {
              console.warn("Could not fetch admin status on auth change:", profileError);
              setIsAdmin(false);
            }
          }
        } else {
          console.log("No user in new session");
          setIsAdmin(false);
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
    } catch (error) {
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
    <AuthContext.Provider value={{ session, user, isLoading, isAdmin, signOut }}>
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
