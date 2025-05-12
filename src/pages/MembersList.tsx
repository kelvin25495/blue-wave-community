
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
import { format } from "date-fns";

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in_at?: string;
}

const MembersList = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast({
          title: "Access denied",
          description: "Please login as admin to access this page",
          variant: "destructive",
        });
        navigate("/admin-login");
        return;
      }
      
      setIsAdmin(true);
      loadMembersData();
    } catch (error) {
      console.error("Error checking session:", error);
      toast({
        title: "Error",
        description: "Failed to verify your session",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  const loadMembersData = async () => {
    try {
      setIsLoading(true);
      
      // First try to get users from auth.users via a function
      const { data: authUsers, error: authError } = await supabase.rpc('get_all_users');
      
      if (authUsers) {
        setMembers(authUsers);
      } else {
        // Fallback to profiles table
        console.log("Falling back to profiles table");
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) throw profilesError;
        
        setMembers(profiles || []);
      }
    } catch (error) {
      console.error("Error loading members data:", error);
      toast({
        title: "Error",
        description: "Failed to load members data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

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
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Registered Date</TableHead>
                    <TableHead>Last Sign In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.full_name || "Not provided"}</TableCell>
                        <TableCell>{formatDate(member.created_at)}</TableCell>
                        <TableCell>{member.last_sign_in_at ? formatDate(member.last_sign_in_at) : "Never"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
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
