
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Access denied",
        description: "Please login to access this page",
        variant: "destructive",
      });
    } else if (!isLoading && requireAdmin && !isAdmin) {
      toast({
        title: "Access denied",
        description: "You need admin access to view this page",
        variant: "destructive",
      });
    }
  }, [isLoading, user, requireAdmin, isAdmin, toast]);

  // Show loading only briefly, then redirect if needed
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to admin login if trying to access admin routes
    if (location.pathname.includes('/admin')) {
      return <Navigate to="/admin-login" state={{ from: location.pathname }} replace />;
    }
    // Otherwise redirect to regular login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
