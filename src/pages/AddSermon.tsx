
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Loader2, Upload } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Date picker components
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const AddSermon = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
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
    
    if (!title || !description || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let imageUrl = "";
      
      // Upload image if available
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from("sermon-images")
          .upload(fileName, image);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("sermon-images")
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }
      
      // Add sermon to database
      const { error } = await supabase.from("sermons").insert({
        title,
        description,
        date: format(date, "yyyy-MM-dd"),
        image_url: imageUrl,
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Sermon added successfully",
      });
      
      navigate("/sermons");
    } catch (error) {
      console.error("Error adding sermon:", error);
      toast({
        title: "Error",
        description: "Failed to add sermon",
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
          <h1 className="text-3xl font-bold mb-6">Add New Sermon</h1>
          
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
                  placeholder="Enter sermon title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description*
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter sermon description"
                  className="min-h-[100px]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date*
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium mb-1">
                  Sermon Image
                </label>
                <div className="mt-1 flex items-center">
                  <Input
                    id="image"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {image ? "Change Image" : "Upload Image"}
                  </Button>
                </div>
                
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                    <div className="relative aspect-video overflow-hidden rounded-md border border-gray-200">
                      <img 
                        src={imagePreview} 
                        alt="Sermon preview" 
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
                  onClick={() => navigate("/sermons")}
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
                    "Save Sermon"
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

export default AddSermon;
