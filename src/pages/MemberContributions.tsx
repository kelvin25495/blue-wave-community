
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, Users, ChartBar } from "lucide-react";
import Footer from "@/components/Footer";

interface Member {
  id: string;
  name: string;
  email: string;
  total_contribution: number;
}

interface Contribution {
  id: string;
  member_id: string;
  amount: number;
  date: string;
  description: string;
}

const MemberContributions = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const [newContribution, setNewContribution] = useState({
    memberId: "",
    amount: "",
    description: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast({
          title: "Access denied",
          description: "Please login to access this page",
          variant: "destructive",
        });
        navigate("/login");
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
      
      setIsAdmin(true);
      fetchMembers();
    };
    
    checkSession();
  }, [navigate, toast]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      
      // Get members with their contributions totals
      const { data, error } = await supabase
        .from('members_with_contributions')
        .select('*');
        
      if (error) throw error;
      
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load members data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "Error",
        description: "Please provide both name and email",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('members')
        .insert({
          name: newMember.name,
          email: newMember.email,
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Member added successfully",
      });
      
      setNewMember({ name: "", email: "" });
      setOpenAddDialog(false);
      fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    }
  };
  
  const addContribution = async () => {
    if (!newContribution.memberId || !newContribution.amount) {
      toast({
        title: "Error",
        description: "Please select a member and provide an amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('contributions')
        .insert({
          member_id: newContribution.memberId,
          amount: parseFloat(newContribution.amount),
          description: newContribution.description || "General contribution",
          date: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Contribution recorded successfully",
      });
      
      setNewContribution({ memberId: "", amount: "", description: "" });
      setOpenEditDialog(false);
      fetchMembers();
    } catch (error) {
      console.error("Error adding contribution:", error);
      toast({
        title: "Error",
        description: "Failed to record contribution",
        variant: "destructive",
      });
    }
  };
  
  const deleteMember = async (memberId: string) => {
    if (window.confirm("Are you sure you want to delete this member? All their contributions will also be deleted.")) {
      try {
        const { error } = await supabase
          .from('members')
          .delete()
          .eq('id', memberId);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Member deleted successfully",
        });
        
        fetchMembers();
      } catch (error) {
        console.error("Error deleting member:", error);
        toast({
          title: "Error",
          description: "Failed to delete member",
          variant: "destructive",
        });
      }
    }
  };

  const calculateTotal = () => {
    return members.reduce((sum, member) => sum + (member.total_contribution || 0), 0);
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
              <h1 className="text-3xl font-bold">Member Contributions</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate("/admin/contributions/report")}>
                <ChartBar className="h-4 w-4 mr-2" />
                View Report
              </Button>
              <Button 
                onClick={() => setOpenAddDialog(true)}
                className="bg-youth-blue hover:bg-youth-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-youth-blue" />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>A list of members and their contributions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Total Contribution</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell className="text-right">
                          ${member.total_contribution?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedMember(member);
                                setNewContribution(c => ({ ...c, memberId: member.id }));
                                setOpenEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        No members found. Add your first member to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">${calculateTotal().toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
          
          {/* Add Member Dialog */}
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Create a new member to track their contributions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addMember} className="bg-youth-blue hover:bg-youth-blue/90">
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Add Contribution Dialog */}
          <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contribution</DialogTitle>
                <DialogDescription>
                  {selectedMember ? `Add a contribution for ${selectedMember.name}` : "Record a new contribution"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newContribution.amount}
                    onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Purpose
                  </Label>
                  <Input
                    id="description"
                    placeholder="General contribution"
                    value={newContribution.description}
                    onChange={(e) => setNewContribution({ ...newContribution, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addContribution} className="bg-youth-blue hover:bg-youth-blue/90">
                  Save Contribution
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MemberContributions;
