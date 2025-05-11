
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Users } from "lucide-react";
import Footer from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at?: string;
}

const MembersList = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
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
      
      // Check if user is admin
      const { data: userData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.session.user.id)
        .single();
        
      if (!userData?.is_admin) {
        toast({
          title: "Access denied",
          description: "You need admin access to view this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      loadMembersData();
    };
    
    checkAdminAndLoadData();
  }, [navigate, toast]);

  const loadMembersData = async () => {
    try {
      setIsLoading(true);
      
      // Get all users from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at, last_sign_in_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setMembers(data || []);
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered Date</TableHead>
                    <TableHead>Last Sign In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>{member.email}</TableCell>
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
