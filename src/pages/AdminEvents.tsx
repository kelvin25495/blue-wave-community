
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const eventTypes = [
  "Regular Meeting",
  "Special Event",
  "Service Project",
  "Worship Event",
  "Other"
];

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
  event_type: z.string().min(1, "Event type is required")
});

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  event_type: string;
  created_at?: string;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      start_time: "18:00",
      end_time: "20:00",
      event_type: "Regular Meeting"
    }
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      filterEvents(activeTab);
    }
  }, [events, activeTab]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = (filterType: string) => {
    if (filterType === "all") {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => 
        event.event_type.toLowerCase().includes(filterType.toLowerCase()));
      setFilteredEvents(filtered);
    }
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      form.reset({
        title: event.title,
        description: event.description,
        date: new Date(event.date),
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        event_type: event.event_type
      });
    } else {
      setEditingEvent(null);
      form.reset({
        title: "",
        description: "",
        location: "",
        start_time: "18:00",
        end_time: "20:00",
        event_type: "Regular Meeting"
      });
    }
    setOpenDialog(true);
  };

  const onSubmit = async (data: z.infer<typeof eventSchema>) => {
    try {
      const formattedDate = format(data.date, "yyyy-MM-dd");
      
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: data.title,
            description: data.description,
            date: formattedDate,
            start_time: data.start_time,
            end_time: data.end_time,
            location: data.location,
            event_type: data.event_type
          })
          .eq('id', editingEvent.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            title: data.title,
            description: data.description,
            date: formattedDate,
            start_time: data.start_time,
            end_time: data.end_time,
            location: data.location,
            event_type: data.event_type
          });
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }
      
      setOpenDialog(false);
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
        
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
            <h1 className="text-3xl font-bold">Events Management</h1>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-youth-blue hover:bg-youth-blue/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-white border">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="regular">Regular Meetings</TabsTrigger>
              <TabsTrigger value="special">Special Events</TabsTrigger>
              <TabsTrigger value="service">Service Projects</TabsTrigger>
              <TabsTrigger value="worship">Worship Events</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-youth-blue" />
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg mb-4">No events found</p>
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
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent 
                ? "Make changes to the existing event" 
                : "Fill in the details for the new event"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Event location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Event description" 
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-youth-blue hover:bg-youth-blue/90">
                  {editingEvent ? "Update Event" : "Add Event"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default AdminEvents;
