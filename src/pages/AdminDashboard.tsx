
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AdminDashboardContent from "@/components/AdminDashboard";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Key, User } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const passwordSchema = z.object({
  currentPassword: z.string().min(3, "Password must be at least 3 characters"),
  newPassword: z.string().min(3, "Password must be at least 3 characters"),
  confirmPassword: z.string().min(3, "Password must be at least 3 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, adminSession } = useAuth();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Load admin login history
    try {
      const history = JSON.parse(localStorage.getItem("adminLoginHistory") || "[]");
      setLoginHistory(history);
    } catch (error) {
      console.error("Error loading login history:", error);
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin dashboard",
    });
    navigate("/admin-login");
  };

  const onChangePassword = async (data: z.infer<typeof passwordSchema>) => {
    setIsPasswordLoading(true);
    
    try {
      // In a real system, we'd update the password in the backend
      // For this custom JS auth system, we'll simulate it
      if (data.currentPassword !== "44123") {
        throw new Error("Current password is incorrect");
      }
      
      // Update the password in localStorage
      localStorage.setItem("adminPassword", data.newPassword);
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      
      passwordForm.reset();
    } catch (error: any) {
      console.error("Change password error:", error);
      toast({
        title: "Password change failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button 
              onClick={handleLogout}
              className="bg-youth-blue hover:bg-youth-blue/90 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
          
          <Tabs defaultValue="dashboard" className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <AdminDashboardContent />
              
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-youth-blue" />
                    <CardTitle>Admin Login History</CardTitle>
                  </div>
                  <CardDescription>
                    History of admin login sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loginHistory.length > 0 ? (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Login Time</TableHead>
                            <TableHead>Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loginHistory.map((login, index) => (
                            <TableRow key={index}>
                              <TableCell>{new Date(login.timestamp).toLocaleString()}</TableCell>
                              <TableCell>{login.email}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p>No login history available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-youth-blue" />
                    <CardTitle>Change Password</CardTitle>
                  </div>
                  <CardDescription>
                    Update your admin password. Make sure to use a strong password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-youth-blue hover:bg-youth-blue/90"
                        disabled={isPasswordLoading}
                      >
                        {isPasswordLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
