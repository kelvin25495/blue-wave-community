
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Image, Users, FileSpreadsheet } from "lucide-react";

const AdminDashboard = () => {
  return (
    <section id="admin" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h2>
        <p className="text-center text-gray-600 mb-8">Manage your youth group activities</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/admin/sermons/add">
            <Card className="card-hover cursor-pointer h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Sermons</CardTitle>
                  <FileText className="h-5 w-5 text-youth-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Manage sermon content including descriptions, dates, and images</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/photos/add">
            <Card className="card-hover cursor-pointer h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Photo Gallery</CardTitle>
                  <Image className="h-5 w-5 text-youth-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Upload and manage photos in the gallery</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/contributions">
            <Card className="card-hover cursor-pointer h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Contributions</CardTitle>
                  <FileSpreadsheet className="h-5 w-5 text-youth-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Track and manage member contributions</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin">
            <Card className="card-hover cursor-pointer h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Members</CardTitle>
                  <Users className="h-5 w-5 text-youth-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">View and manage member information</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
