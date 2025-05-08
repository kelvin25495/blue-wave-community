
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (!error && data.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Check if user is admin
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("is_admin")
              .eq("id", data.session.user.id)
              .single();
              
            setIsAdmin(profileData?.is_admin || false);
          } catch (profileError) {
            // If profiles table doesn't exist or there's an error, default to non-admin
            console.warn("Could not fetch admin status:", profileError);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setIsLoading(true);
        
        if (newSession?.user) {
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("is_admin")
              .eq("id", newSession.user.id)
              .single();
              
            setIsAdmin(profileData?.is_admin || false);
          } catch (profileError) {
            console.warn("Could not fetch admin status on auth change:", profileError);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
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
