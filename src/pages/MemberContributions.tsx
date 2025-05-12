
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChartBar, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ContributionsManager from "@/components/ContributionsManager";

const MemberContributions = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log("Checking admin session...");
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log("No session found, redirecting to login");
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
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking session:", error);
      toast({
        title: "Error",
        description: "Failed to verify your session",
        variant: "destructive",
      });
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
