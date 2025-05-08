
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AddPhoto = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !image) {
      toast({
        title: "Error",
        description: "Please provide a title and upload an image",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Upload image
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from("gallery-images")
        .upload(fileName, image);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("gallery-images")
        .getPublicUrl(fileName);
        
      const imageUrl = publicUrlData.publicUrl;
      
      // Add photo to database
      const { error } = await supabase.from("photos").insert({
        title,
        image_url: imageUrl,
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Photo added successfully",
      });
      
      navigate("/gallery");
    } catch (error) {
      console.error("Error adding photo:", error);
      toast({
        title: "Error",
        description: "Failed to add photo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Add New Photo</h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title*
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter photo title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="photo-upload" className="block text-sm font-medium mb-1">
                  Photo*
                </label>
                <div className="mt-1 flex items-center">
                  <Input
                    id="photo-upload"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("photo-upload")?.click()}
                    className="w-full flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {image ? "Change Photo" : "Upload Photo"}
                  </Button>
                </div>
                
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Photo Preview:</p>
                    <div className="relative aspect-square overflow-hidden rounded-md border border-gray-200">
                      <img 
                        src={imagePreview} 
                        alt="Gallery preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/gallery")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-youth-blue hover:bg-youth-blue/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Photo"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddPhoto;
