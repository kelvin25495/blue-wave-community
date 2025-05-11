
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import { ensureStorageBuckets } from "./lib/storage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Sermons from "./pages/Sermons";
import AddSermon from "./pages/AddSermon";
import PhotoGallery from "./pages/PhotoGallery";
import AddPhoto from "./pages/AddPhoto";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MemberContributions from "./pages/MemberContributions";
import ContributionsReport from "./pages/ContributionsReport";
import AdminEvents from "./pages/AdminEvents";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Initialize storage buckets when app loads
  useEffect(() => {
    ensureStorageBuckets();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/sermons" 
                element={
                  <ProtectedRoute>
                    <Sermons />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gallery" 
                element={
                  <ProtectedRoute>
                    <PhotoGallery />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/sermons/add" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddSermon />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/photos/add" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddPhoto />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/contributions" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <MemberContributions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/contributions/report" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ContributionsReport />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/events" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminEvents />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
