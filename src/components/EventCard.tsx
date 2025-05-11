
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EventProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    event_type: string;
  };
  onEdit: (event: any) => void;
  onDelete: (id: string) => void;
}

const EventCard = ({ event, onEdit, onDelete }: EventProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      setIsDeleting(true);
      await onDelete(event.id);
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
          <span className="bg-youth-blue/10 text-youth-blue text-xs px-2 py-1 rounded">
            {event.event_type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(event.date)}, {event.start_time} - {event.end_time}
          </span>
        </div>
        <p className="text-sm line-clamp-3 text-gray-700">{event.description}</p>
        <p className="text-sm font-medium mt-2">Location: {event.location}</p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end gap-2 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onEdit(event)}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="h-8 px-2"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
