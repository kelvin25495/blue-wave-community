import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import EventCard from "@/components/EventCard";
import { Calendar, Loader2, Plus, AlertTriangle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  event_type: string;
}

const eventTypes = [
  { value: "regular", label: "Regular Meeting" },
  { value: "special", label: "Special Event" },
  { value: "service", label: "Service Project" },
  { value: "worship", label: "Worship Event" },
];

const initialEvent: Event = {
  id: "",
  title: "",
  description: "",
  date: "",
  start_time: "",
  end_time: "",
  location: "",
  event_type: "regular",
};

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event>(initialEvent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log("Fetching events...");
      
      // Try to query the events table first
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
        
      if (error) {
        console.error("Error fetching events:", error);
        
        // If table doesn't exist, try to create it
        try {
          console.log("Events table might not exist, trying to create it...");
          
          // Use proper SQL execution through Supabase RPC
          const { error: createError } = await supabase.rpc('create_events_table');
          
          if (createError) {
            console.log("RPC failed, table might already exist:", createError);
          }
          
          // Try to fetch again
          const { data: newData, error: newError } = await supabase
            .from("events")
            .select("*")
            .order("date", { ascending: true });
            
          if (newError) {
            throw new Error("Could not access events table after creation attempt");
          }
          
          console.log("Fetched events after table creation:", newData);
          setEvents(newData || []);
        } catch (createError) {
          console.error("Error creating events table:", createError);
          setLoadError("Failed to load events. The events table might not exist or could not be created.");
          throw createError;
        }
      } else {
        console.log("Fetched events:", data);
        setEvents(data || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoadError("Failed to load events data");
      toast({
        title: "Error",
        description: "Failed to load events data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setCurrentEvent(event);
      setIsEditing(true);
    } else {
      setCurrentEvent(initialEvent);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleChange = (field: string, value: string) => {
    setCurrentEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!currentEvent.title || !currentEvent.date || !currentEvent.start_time || !currentEvent.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Update existing event
        const { error } = await supabase
          .from("events")
          .update({
            title: currentEvent.title,
            description: currentEvent.description,
            date: currentEvent.date,
            start_time: currentEvent.start_time,
            end_time: currentEvent.end_time,
            location: currentEvent.location,
            event_type: currentEvent.event_type,
          })
          .eq("id", currentEvent.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        // Add new event
        const newEvent = {
          ...currentEvent,
          id: uuidv4(),
        };
        
        const { error } = await supabase
          .from("events")
          .insert(newEvent);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Event added successfully",
        });
      }
      
      // Reset form and refresh data
      setOpenDialog(false);
      setCurrentEvent(initialEvent);
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-youth-blue" />
              <h1 className="text-3xl font-bold">Manage Events</h1>
            </div>
            
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-youth-blue hover:bg-youth-blue/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-youth-blue" />
            </div>
          ) : loadError ? (
            <div className="bg-white rounded-lg p-6 text-center shadow">
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{loadError}</AlertDescription>
              </Alert>
              <Button onClick={fetchEvents} className="mt-4">
                <Loader2 className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onEdit={() => handleOpenDialog(event)} 
                  onDelete={handleDelete} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first event</p>
              <Button 
                onClick={() => handleOpenDialog()}
                className="bg-youth-blue hover:bg-youth-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Event
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the event details below' : 'Fill in the event details to create a new event'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={currentEvent.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={currentEvent.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={currentEvent.start_time}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={currentEvent.end_time}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={currentEvent.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Select 
                value={currentEvent.event_type} 
                onValueChange={(value) => handleChange('event_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentEvent.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the event"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-youth-blue hover:bg-youth-blue/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvents;
