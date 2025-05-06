
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Calendar, Users, MessageSquare } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for the charts
const attendanceData = [
  { month: 'Jan', attendance: 40 },
  { month: 'Feb', attendance: 35 },
  { month: 'Mar', attendance: 45 },
  { month: 'Apr', attendance: 50 },
  { month: 'May', attendance: 55 },
];

const eventData = [
  { month: 'Jan', events: 4, registrations: 28 },
  { month: 'Feb', events: 3, registrations: 22 },
  { month: 'Mar', events: 5, registrations: 37 },
  { month: 'Apr', events: 4, registrations: 42 },
  { month: 'May', events: 6, registrations: 49 },
];

const AdminDashboard = () => {
  return (
    <section id="admin" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h2>
        <p className="text-center text-gray-600 mb-8">Manage your youth group activities and monitor engagement</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Total Members</CardTitle>
                <Users className="h-5 w-5 text-youth-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">128</p>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">New Members</CardTitle>
                <UserPlus className="h-5 w-5 text-youth-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">24</p>
              <p className="text-xs text-green-600 mt-1">+8% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <Calendar className="h-5 w-5 text-youth-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">6</p>
              <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Forum Activity</CardTitle>
                <MessageSquare className="h-5 w-5 text-youth-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">52</p>
              <p className="text-xs text-green-600 mt-1">+18% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attendance">Attendance Trends</TabsTrigger>
            <TabsTrigger value="events">Event Registrations</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendance" stroke="#0895cf" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Registrations</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="events" stroke="#0895cf" strokeWidth={2} />
                    <Line type="monotone" dataKey="registrations" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 mb-2">Access restricted to administrators only.</p>
          <Button className="bg-youth-blue hover:bg-youth-blue/90">Admin Login</Button>
        </div>
      </div>
    </section>
  );
};

// Importing Button at the end to avoid issues with out-of-order imports
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default AdminDashboard;
