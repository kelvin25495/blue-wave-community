
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import AdminDashboardContent from "@/components/AdminDashboard";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Settings, Key, User } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const emailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: user?.email || "",
      password: "",
    },
  });

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
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: data.currentPassword,
      });
      
      if (signInError) throw new Error("Current password is incorrect");
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (updateError) throw updateError;
      
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

  const onChangeEmail = async (data: z.infer<typeof emailSchema>) => {
    setIsEmailLoading(true);
    
    try {
      // First verify the password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: data.password,
      });
      
      if (signInError) throw new Error("Password is incorrect");
      
      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: data.newEmail,
      });
      
      if (updateError) throw updateError;
      
      toast({
        title: "Email updated",
        description: "Your email has been changed successfully. Please check your new email for verification.",
      });
      
      emailForm.reset();
      emailForm.setValue("newEmail", data.newEmail);
    } catch (error: any) {
      console.error("Change email error:", error);
      toast({
        title: "Email change failed",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setIsEmailLoading(false);
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
              <TabsTrigger value="account">Account Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <AdminDashboardContent />
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
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-youth-blue" />
                    <CardTitle>Change Email</CardTitle>
                  </div>
                  <CardDescription>
                    Update your admin email. You will need to verify your new email address.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onChangeEmail)} className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="newEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="admin@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm with Password</FormLabel>
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
                        disabled={isEmailLoading}
                      >
                        {isEmailLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Email"
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
