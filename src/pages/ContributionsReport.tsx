
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { ChartBar, Download, Loader2, Calendar, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MonthlyContribution {
  month: string;
  total: number;
}

const ContributionsReport = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
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
      fetchMonthlyData();
    };
    
    checkSession();
  }, [navigate, toast]);

  const fetchMonthlyData = async () => {
    try {
      setIsLoading(true);
      
      // This assumes you have a view or function that aggregates monthly contributions
      const { data, error } = await supabase
        .from('monthly_contributions')
        .select('*')
        .order('month');
        
      if (error) throw error;
      
      // Format data for the chart
      const formattedData = (data || []).map(item => ({
        month: item.month,
        total: parseFloat(item.total),
      }));
      
      setMonthlyData(formattedData);
    } catch (error) {
      console.error("Error fetching contribution data:", error);
      toast({
        title: "Error",
        description: "Failed to load contribution data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              <ChartBar className="h-6 w-6 text-youth-blue" />
              <h1 className="text-3xl font-bold">Contributions Report</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate("/admin/contributions")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contributions
              </Button>
              <Button 
                onClick={() => {/* Export functionality would go here */}}
                className="bg-youth-blue hover:bg-youth-blue/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-youth-blue" />
              Monthly Contribution Trends
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-youth-blue" />
              </div>
            ) : monthlyData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="total" name="Total Contributions" fill="#0895cf" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No contribution data available yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContributionsReport;
