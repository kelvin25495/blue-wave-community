
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface PhotoProps {
  photo: {
    id: string;
    title: string;
    image_url: string;
  };
  onUpdate: () => void;
  isAdmin: boolean;
}

const PhotoCard = ({ photo, onUpdate, isAdmin }: PhotoProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        setIsDeleting(true);
        
        // Delete the photo record
        const { error } = await supabase
          .from("photos")
          .delete()
          .eq("id", photo.id);
          
        if (error) throw error;
        
        // Delete the image from storage
        if (photo.image_url) {
          const imagePath = photo.image_url.split("/").pop();
          if (imagePath) {
            await supabase.storage
              .from("photos")  // Changed from gallery-images to photos
              .remove([imagePath]);
          }
        }
        
        toast({
          title: "Success",
          description: "Photo deleted successfully",
        });
        
        onUpdate();
      } catch (error) {
        console.error("Error deleting photo:", error);
        toast({
          title: "Error",
          description: "Failed to delete photo",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden">
          <img 
            src={photo.image_url} 
            alt={photo.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </CardContent>
      {isAdmin && (
        <CardFooter className="p-2 bg-white flex justify-between items-center">
          <p className="text-sm font-medium truncate">{photo.title}</p>
          <Button 
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PhotoCard;
