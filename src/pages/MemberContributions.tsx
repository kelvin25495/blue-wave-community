
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChartBar, ArrowLeft, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ContributionsManager from "@/components/ContributionsManager";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MemberContributions = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log("Checking admin session...");
      setIsLoading(true);
      setAuthError(null);
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log("No session found, redirecting to login");
        setAuthError("You must be logged in to access this page");
        toast({
          title: "Access denied",
          description: "Please login to access this page",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      console.log("Session found, assuming admin access");
      setIsAdmin(true);

      // Check if contributions table exists
      try {
        console.log("Checking if tables exist");
        const { error: membersRpcError } = await supabase.rpc('create_members_table');
        if (membersRpcError) {
          console.log("Members RPC not available or already exists:", membersRpcError);
        }
        
        const { error: contribRpcError } = await supabase.rpc('create_contributions_table');
        if (contribRpcError) {
          console.log("Contributions RPC not available or already exists:", contribRpcError);
        }
        
        console.log("Tables checked");
      } catch (error) {
        console.log("Error checking tables, will proceed anyway:", error);
      }
      
    } catch (error) {
      console.error("Error checking session:", error);
      setAuthError("Failed to verify your session");
      toast({
        title: "Error",
        description: "Failed to verify your session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-12 bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-youth-blue"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-12 bg-gray-50 flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-md">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate("/login")} 
              className="w-full bg-youth-blue hover:bg-youth-blue/90"
            >
              Go to Login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Member Contributions</h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate("/admin/contributions/report")}>
                <ChartBar className="h-4 w-4 mr-2" />
                View Report
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
          
          <ContributionsManager />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MemberContributions;
