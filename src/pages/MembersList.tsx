
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Users, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Profile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

const MembersList = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadMembersData();
  }, []);

  const loadMembersData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log("Loading members data...");

      // Fetch from profiles table directly - more reliable than auth admin
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, name, phone');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setLoadError("Failed to fetch member data from profiles table");
        toast({
          title: "Error",
          description: "Failed to load members data",
          variant: "destructive",
        });
      } else {
        console.log("Fetched profiles:", profiles);
        setMembers(profiles || []);
      }
    } catch (error) {
      console.error("Error loading members data:", error);
      setLoadError("An unexpected error occurred");
      toast({
        title: "Error",
        description: "Failed to load members data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-youth-blue" />
              <h1 className="text-3xl font-bold">Registered Members</h1>
            </div>
            <Button 
              onClick={() => navigate("/admin")}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-youth-blue" />
            </div>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-2">{loadError}</p>
              <Button 
                onClick={loadMembersData}
                variant="outline"
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name || "Not provided"}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone || "Not provided"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                        No registered members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MembersList;
