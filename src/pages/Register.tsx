import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Church, Loader2, AlertCircle } from "lucide-react";
import { supabase, checkSupabaseConnection } from "@/lib/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setConnectionError(false);
    
    try {
      console.log("Testing Supabase connection before registration...");
      
      // First check if we can reach Supabase
      const canConnect = await checkSupabaseConnection();
      if (!canConnect) {
        setConnectionError(true);
        throw new Error("Cannot connect to Supabase. Please check your internet connection and try again.");
      }
      
      console.log("Attempting registration with email:", data.email);
      
      // Register with Supabase auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          }
        }
      });
      
      if (error) {
        console.error("Registration error:", error);
        throw error;
      }
      
      console.log("Registration successful for user:", authData.user?.email);
      
      // Create profile record - this contains the user's name and phone number
      if (authData.user) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: authData.user.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              is_admin: false, // default to regular user
            });
            
          if (profileError) {
            console.warn("Could not create profile record:", profileError);
          }
        } catch (profileError) {
          console.warn("Could not create profile record:", profileError);
        }
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now sign in.",
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Could not create your account";
      
      if (error.message?.includes("fetch") || error.message?.includes("connect")) {
        setConnectionError(true);
        errorMessage = "Connection failed. Please check your internet connection and try again.";
      } else if (error.message?.includes("already registered")) {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            <Church size={36} className="text-youth-blue" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Register to join the youth group community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to connect to the server. Please check your internet connection and try again.
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-youth-blue hover:bg-youth-blue/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-youth-blue hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
