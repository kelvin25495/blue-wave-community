
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
    if (!isLoading) {
      if (!user) {
        toast({
          title: "Access denied",
          description: "Please login to access this page",
          variant: "destructive",
        });
      } else if (requireAdmin && !isAdmin) {
        toast({
          title: "Access denied",
          description: "You need admin access to view this page",
          variant: "destructive",
        });
      }
    }
  }, [isLoading, user, requireAdmin, isAdmin, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
