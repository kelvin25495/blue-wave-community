
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin, adminSession } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  console.log("ProtectedRoute - User:", user?.email);
  console.log("ProtectedRoute - IsLoading:", isLoading);
  console.log("ProtectedRoute - IsAdmin:", isAdmin);
  console.log("ProtectedRoute - RequireAdmin:", requireAdmin);
  console.log("ProtectedRoute - AdminSession:", adminSession);

  useEffect(() => {
    if (!isLoading && !user && !adminSession && !location.pathname.includes('/admin')) {
      toast({
        title: "Access denied",
        description: "Please login to access this page",
        variant: "destructive",
      });
    } else if (!isLoading && requireAdmin && !isAdmin && !adminSession) {
      toast({
        title: "Access denied",
        description: "You need admin access to view this page",
        variant: "destructive",
      });
    }
  }, [isLoading, user, requireAdmin, isAdmin, adminSession, toast, location.pathname]);

  // Show brief loading indicator, max 2 seconds to avoid endless loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-youth-blue"></div>
      </div>
    );
  }

  // For admin routes, check if admin is logged in via adminSession
  if (requireAdmin) {
    if (!isAdmin && !adminSession) {
      return <Navigate to="/admin-login" state={{ from: location.pathname }} replace />;
    }
    return <>{children}</>;
  }

  // For regular protected routes
  if (!user && !adminSession) {
    // Redirect to admin login if trying to access admin routes
    if (location.pathname.includes('/admin')) {
      return <Navigate to="/admin-login" state={{ from: location.pathname }} replace />;
    }
    // Otherwise redirect to regular login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
