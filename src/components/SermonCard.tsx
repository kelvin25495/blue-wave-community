
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface SermonProps {
  sermon: {
    id: string;
    title: string;
    description: string;
    date: string;
    image_url: string;
  };
  onUpdate: () => void;
  isAdmin: boolean;
}

const SermonCard = ({ sermon, onUpdate, isAdmin }: SermonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const formattedDate = sermon.date ? format(new Date(sermon.date), "MMMM d, yyyy") : "Unknown date";
  
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this sermon?")) {
      try {
        setIsDeleting(true);
        
        // Delete the sermon record
        const { error } = await supabase
          .from("sermons")
          .delete()
          .eq("id", sermon.id);
          
        if (error) throw error;
        
        // If there's an image, delete it from storage
        if (sermon.image_url) {
          const imagePath = sermon.image_url.split("/").pop();
          if (imagePath) {
            await supabase.storage
              .from("sermon-images")
              .remove([imagePath]);
          }
        }
        
        toast({
          title: "Success",
          description: "Sermon deleted successfully",
        });
        
        onUpdate();
      } catch (error) {
        console.error("Error deleting sermon:", error);
        toast({
          title: "Error",
          description: "Failed to delete sermon",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden bg-gray-100">
        {sermon.image_url ? (
          <img 
            src={sermon.image_url} 
            alt={sermon.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-gray-500">No image</span>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl line-clamp-1">{sermon.title}</CardTitle>
        <p className="text-sm text-gray-500">{formattedDate}</p>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 line-clamp-2">{sermon.description}</p>
      </CardContent>
      {isAdmin && (
        <CardFooter className="flex justify-end gap-2 pt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/admin/sermons/edit/${sermon.id}`)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default SermonCard;
