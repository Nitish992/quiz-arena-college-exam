
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Index from "./pages/Index";
import StudentAuth from "./pages/StudentAuth";
import StaffAuth from "./pages/StaffAuth";
import AdminDashboard from "./pages/admin/Index";
import TeacherDashboard from "./pages/teacher/Index";
import StudentDashboard from "./pages/student/Index";
import QuizPage from "./pages/student/Quiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { user, profile, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user || !profile || !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate login page based on the required role
    if (allowedRoles.includes('student')) {
      return <Navigate to="/student-auth" />;
    } else {
      return <Navigate to="/staff-auth" />;
    }
  }
  
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    
    <Route path="/student-auth" element={<StudentAuth />} />
    <Route path="/staff-auth" element={<StaffAuth />} />
    
    <Route 
      path="/admin" 
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } 
    />
    
    <Route 
      path="/teacher" 
      element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <TeacherDashboard />
        </ProtectedRoute>
      } 
    />
    
    <Route 
      path="/student" 
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } 
    />
    
    <Route 
      path="/student/quiz/:quizId" 
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <QuizPage />
        </ProtectedRoute>
      } 
    />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
