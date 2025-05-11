
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, Users, ChartBar, Save, X } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
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
import { 
  Member, 
  Contribution, 
  fetchMembers, 
  addMember, 
  updateMember, 
  deleteMember, 
  addContribution,
  getCurrentWeek,
  formatWeek 
} from "@/lib/memberUtils";

const MemberContributions = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const [contributions, setContributions] = useState<Record<string, number>>({});
  const [editedName, setEditedName] = useState("");
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  
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
      
      // Check if user is admin (we can use the adminSession instead)
      const { data: adminData } = await supabase.auth.getSession();
      if (adminData.session) {
        setIsAdmin(true);
        loadMembersData();
      } else {
        toast({
          title: "Access denied",
          description: "You need admin access to view this page",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  const loadMembersData = async () => {
    try {
      setIsLoading(true);
      
      // Create tables if they don't exist
      await ensureTables();
      
      // Get members data
      const membersData = await fetchMembers();
      setMembers(membersData);
      
      // Initialize contributions object for the current week
      const initialContributions: Record<string, number> = {};
      for (const member of membersData) {
        if (member.id) {
          initialContributions[member.id] = 0;
        }
      }
      setContributions(initialContributions);

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

  const ensureTables = async () => {
    // Check if tables exist, and if not, create them
    const { error: checkError } = await supabase
      .from('members')
      .select('id')
      .limit(1);
    
    if (checkError) {
      // Table might not exist, let's create it
      await supabase.rpc('create_members_table');
      await supabase.rpc('create_contributions_table');
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "Error",
        description: "Please provide both name and email",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addMember(newMember.name, newMember.email);
      
      toast({
        title: "Success",
        description: "Member added successfully",
      });
      
      setNewMember({ name: "", email: "" });
      setOpenAddDialog(false);
      loadMembersData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteMember = async (memberId: string) => {
    if (window.confirm("Are you sure you want to delete this member? All their contributions will also be deleted.")) {
      try {
        await deleteMember(memberId);
        
        toast({
          title: "Success",
          description: "Member deleted successfully",
        });
        
        loadMembersData();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete member",
          variant: "destructive",
        });
      }
    }
  };
  
  const startEditing = (member: Member) => {
    if (member.id) {
      setEditingMemberId(member.id);
      setEditedName(member.name);
    }
  };

  const saveEditing = async (memberId: string) => {
    try {
      await updateMember(memberId, { name: editedName });
      
      toast({
        title: "Success",
        description: "Member name updated successfully",
      });
      
      setEditingMemberId(null);
      loadMembersData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member name",
        variant: "destructive",
      });
    }
  };
  
  const cancelEditing = () => {
    setEditingMemberId(null);
  };

  const handleContributionChange = (memberId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setContributions({
      ...contributions,
      [memberId]: amount
    });
  };

  const saveContributions = async () => {
    try {
      for (const [memberId, amount] of Object.entries(contributions)) {
        if (amount > 0) {
          await addContribution(memberId, amount, currentWeek);
        }
      }
      
      toast({
        title: "Success",
        description: "Contributions saved successfully",
      });
      
      // Reset contributions
      const resetContributions: Record<string, number> = {};
      for (const member of members) {
        if (member.id) {
          resetContributions[member.id] = 0;
        }
      }
      setContributions(resetContributions);
      
      // Reload data to get updated totals
      loadMembersData();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contributions",
        variant: "destructive",
      });
    }
  };

  const calculateTotalContributions = () => {
    return Object.values(contributions).reduce((sum, amount) => sum + amount, 0);
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
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-medium mb-4">Current Week: {formatWeek(currentWeek)}</h2>
            <p className="text-gray-600 mb-4">
              Add contributions for each member for this week and click 'Save Contributions' when done.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-youth-blue" />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableCaption>Weekly contributions for each member</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>This Week's Contribution ($)</TableHead>
                    <TableHead>Previous Total ($)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length > 0 ? (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {editingMemberId === member.id ? (
                            <Input 
                              value={editedName} 
                              onChange={(e) => setEditedName(e.target.value)} 
                              className="w-full"
                            />
                          ) : (
                            member.name
                          )}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            value={member.id ? contributions[member.id] || "" : ""}
                            onChange={(e) => member.id && handleContributionChange(member.id, e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          ${member.total_contribution?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {editingMemberId === member.id ? (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => member.id && saveEditing(member.id)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={cancelEditing}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => startEditing(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => member.id && handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                        No members found. Add your first member to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Weekly Total</TableCell>
                    <TableCell>${calculateTotalContributions().toFixed(2)}</TableCell>
                    <TableCell colSpan={2} className="text-right">
                      <Button 
                        onClick={saveContributions}
                        className="bg-youth-blue hover:bg-youth-blue/90"
                        disabled={calculateTotalContributions() <= 0}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Contributions
                      </Button>
                    </TableCell>
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
                <Button onClick={handleAddMember} className="bg-youth-blue hover:bg-youth-blue/90">
                  Add Member
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
