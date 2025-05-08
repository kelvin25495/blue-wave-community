
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotoCard from "@/components/PhotoCard";
import { Image, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface Photo {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
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
          description: "Please log in to view the gallery",
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
      
      // Fetch photos
      fetchPhotos();
    };
    
    checkSession();
  }, [navigate, toast]);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast({
        title: "Error",
        description: "Failed to load photo gallery",
        variant: "destructive",
      });
    } finally {
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
              <Image className="h-6 w-6 text-youth-blue" />
              <h1 className="text-3xl font-bold">Photo Gallery</h1>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => navigate("/admin/photos/add")} 
                className="bg-youth-blue hover:bg-youth-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md aspect-square animate-pulse">
                  <div className="h-full bg-gray-200 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} onUpdate={fetchPhotos} isAdmin={isAdmin} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No photos available yet</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PhotoGallery;
