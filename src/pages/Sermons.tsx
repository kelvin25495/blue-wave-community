
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SermonCard from "@/components/SermonCard";
import { Book, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface Sermon {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url: string;
}

const Sermons = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast({
          title: "Access restricted",
          description: "Please log in to view sermons",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      setIsAuthenticated(true);
      
      // Check if user is admin
      const { data: userData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.session.user.id)
        .single();
        
      setIsAdmin(userData?.is_admin || false);
      
      // Fetch sermons
      fetchSermons();
    };
    
    checkSession();
  }, [navigate, toast]);

  const fetchSermons = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("date", { ascending: false });
        
      if (error) throw error;
      
      // Always set sermons to an array (empty if no data)
      setSermons(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching sermons:", error);
      toast({
        title: "Error",
        description: "Failed to load sermons",
        variant: "destructive",
      });
      // Even if there's an error, we want to stop loading
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <Book className="h-6 w-6 text-youth-blue" />
              <h1 className="text-3xl font-bold">Sermons</h1>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => navigate("/admin/sermons/add")} 
                className="bg-youth-blue hover:bg-youth-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sermon
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-youth-blue"></div>
            </div>
          ) : sermons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sermons.map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} onUpdate={fetchSermons} isAdmin={isAdmin} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No sermons available yet</p>
              {isAdmin && (
                <Button 
                  onClick={() => navigate("/admin/sermons/add")} 
                  className="bg-youth-blue hover:bg-youth-blue/90 mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Sermon
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sermons;
