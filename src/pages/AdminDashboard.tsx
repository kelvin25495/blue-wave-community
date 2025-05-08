
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AdminDashboardContent from "@/components/AdminDashboard";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin dashboard",
    });
    navigate("/login");
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
          <AdminDashboardContent />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
