
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Filter } from 'lucide-react';

// Mock event data
const events = [
  {
    id: 1,
    title: "Weekly Youth Group",
    date: "2025-05-10",
    time: "7:00 PM - 9:00 PM",
    location: "Church Hall",
    category: "regular",
    description: "Join us for worship, games, and a message from Pastor Mike."
  },
  {
    id: 2,
    title: "Summer Camp Registration",
    date: "2025-05-15",
    time: "All Day",
    location: "Online",
    category: "special",
    description: "Register early for our annual summer camp adventure! Limited spots available."
  },
  {
    id: 3,
    title: "Community Service Project",
    date: "2025-05-18",
    time: "10:00 AM - 2:00 PM",
    location: "Downtown Community Center",
    category: "service",
    description: "Help serve meals and create care packages for those in need."
  },
  {
    id: 4,
    title: "Youth Worship Night",
    date: "2025-05-24",
    time: "6:30 PM - 8:30 PM",
    location: "Main Sanctuary",
    category: "worship",
    description: "A night dedicated to worship and prayer."
  },
];

// Category options for filtering
const categories = [
  { value: 'all', label: 'All Events' },
  { value: 'regular', label: 'Regular Meetings' },
  { value: 'special', label: 'Special Events' },
  { value: 'service', label: 'Service Projects' },
  { value: 'worship', label: 'Worship Events' }
];

const EventsSection = () => {
  const [filter, setFilter] = useState('all');
  
  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.category === filter);

  return (
    <section id="events" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Upcoming Events</h2>
        
        <div className="flex items-center justify-center mb-8 flex-wrap gap-2">
          <Filter className="text-youth-blue mr-2" size={20} />
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={filter === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(category.value)}
                className={filter === category.value ? "bg-youth-blue hover:bg-youth-blue/90" : ""}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="card-hover overflow-hidden border-t-4 border-t-youth-blue">
              <CardHeader className="pb-2">
                <CardTitle>{event.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar size={16} className="text-youth-blue" />
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </CardDescription>
                <CardDescription className="flex items-center gap-1">
                  <Clock size={16} className="text-youth-blue" />
                  {event.time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{event.description}</p>
                <p className="mt-2 text-sm font-medium">Location: {event.location}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">View Details</Button>
                <Button size="sm" className="bg-youth-blue hover:bg-youth-blue/90">RSVP</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button className="bg-youth-blue hover:bg-youth-blue/90">
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
