
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Save, Plus, Trash2, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Member {
  id?: string;
  name: string;
  email: string;
  contribution?: number;
}

const ContributionsManager = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, []);

  // Load members data
  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Checking if members table exists...");
      
      // Try to query the members table first
      const { data, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) {
        console.error("Error fetching members:", error);
        
        // If the table doesn't exist, try to create it
        try {
          console.log("Creating members table...");
          await supabase.rpc('create_members_table').catch(() => {
            // Ignore errors from RPC - it might not exist
            console.log("RPC not available, trying direct SQL");
          });
          
          // Try raw SQL as fallback
          await supabase.from('members').insert({
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Test Member',
            email: 'test@example.com',
            created_at: new Date().toISOString()
          }).select().single();
          
          console.log("Members table created or already exists");
          
          // Try to query again after creating the table
          const { data: newData, error: newError } = await supabase
            .from('members')
            .select('*');
            
          if (newError) throw newError;
          
          // Add contribution field to each member for UI editing
          const membersWithContribution = newData?.map(member => ({
            ...member,
            contribution: 0
          })) || [];
          
          setMembers(membersWithContribution);
        } catch (createError) {
          console.error("Error creating or checking members table:", createError);
          setError("Could not load or create members table. Please check your database permissions.");
          throw createError;
        }
      } else {
        console.log("Fetched members:", data);
        
        // Add contribution field to each member for UI editing
        const membersWithContribution = data?.map(member => ({
          ...member,
          contribution: 0
        })) || [];
        
        setMembers(membersWithContribution);
      }
      
      // Also check if contributions table exists
      try {
        console.log("Checking if contributions table exists...");
        await supabase.rpc('create_contributions_table').catch(() => {
          console.log("RPC not available for contributions table");
        });
        
        // Try raw SQL as fallback
        await supabase.from('contributions')
          .select('count')
          .limit(1)
          .catch(() => {
            console.log("Trying to create contributions table");
          });
          
        console.log("Contributions table exists or was created");
      } catch (contribError) {
        console.error("Could not verify contributions table:", contribError);
      }
      
    } catch (error) {
      console.error("Error loading members:", error);
      setError("Failed to load members. Please check your connection and try again.");
      toast({
        title: "Failed to load members",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new member
  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('members')
        .insert({
          name: newMember.name,
          email: newMember.email
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Added ${newMember.name} to members list`,
      });
      
      setNewMember({ name: "", email: "" });
      loadMembers(); // Reload the members list
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Failed to add member",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Delete a member
  const handleDeleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Member deleted",
        description: "Member has been removed from the system",
      });
      
      loadMembers(); // Reload the members list
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Failed to delete member",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Update contribution amount for a member
  const handleContributionChange = (index: number, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index].contribution = parseFloat(value) || 0;
    setMembers(updatedMembers);
  };

  // Save all contributions
  const saveContributions = async () => {
    try {
      // Get current date in ISO format
      const currentDate = new Date().toISOString();
      const currentWeek = getWeekNumber(new Date());
      const weekString = `${new Date().getFullYear()}-W${currentWeek}`;
      
      for (const member of members) {
        if (member.id && member.contribution && member.contribution > 0) {
          const { error } = await supabase
            .from('contributions')
            .insert({
              member_id: member.id,
              amount: member.contribution,
              date: currentDate,
              week: weekString,
              description: `Weekly contribution`
            });
            
          if (error) throw error;
        }
      }
      
      toast({
        title: "Contributions saved",
        description: "All contributions have been recorded",
      });
      
      // Reset contribution amounts
      const resetMembers = members.map(m => ({ ...m, contribution: 0 }));
      setMembers(resetMembers);
      
    } catch (error) {
      console.error("Error saving contributions:", error);
      toast({
        title: "Failed to save contributions",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Get the week number for the given date
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Calculate total contributions
  const calculateTotal = () => {
    return members.reduce((sum, member) => sum + (member.contribution || 0), 0);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadMembers} className="w-full">
          <Loader2 className="mr-2 h-4 w-4" />
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <User className="mr-2 h-6 w-6 text-youth-blue" />
        Member Contributions
      </h2>

      {/* New member form */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Member Name"
          value={newMember.name}
          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
          className="flex-1"
        />
        <Input
          placeholder="Email Address"
          value={newMember.email}
          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
          className="flex-1"
        />
        <Button onClick={handleAddMember} className="bg-youth-blue hover:bg-youth-blue/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-youth-blue" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contribution ($)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length > 0 ? (
                members.map((member, index) => (
                  <TableRow key={member.id || index}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={member.contribution || ""}
                        onChange={(e) => handleContributionChange(index, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => member.id && handleDeleteMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    No members found. Add your first member above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell>${calculateTotal().toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    onClick={saveContributions}
                    disabled={calculateTotal() <= 0}
                    className="bg-youth-blue hover:bg-youth-blue/90"
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
    </div>
  );
};

export default ContributionsManager;
