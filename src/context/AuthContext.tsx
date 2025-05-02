
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ProfileType } from '@/types/auth';
import { authService } from '@/services/auth';

interface AuthContextType {
  user: any | null;
  profile: ProfileType | null;
  loginStudent: (roll_number: string, dob: string) => Promise<boolean>;
  loginStaff: (username: string, password: string) => Promise<{success: boolean, role?: string}>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('currentUser');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (savedProfile && isAuthenticated) {
      try {
        const parsedProfile = JSON.parse(savedProfile) as ProfileType;
        setProfile(parsedProfile);
        setUser({ id: parsedProfile.id }); // Simplified user object
      } catch (error) {
        console.error('Error parsing stored profile:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Student login (roll number + DOB)
  const loginStudent = async (roll_number: string, dob: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Student login attempt:', roll_number);
      const result = await authService.loginStudent(roll_number, dob);
      
      if (result.success && result.profile) {
        setUser({ id: result.profile.id });
        setProfile(result.profile);
        
        // Store auth info in localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(result.profile));
        localStorage.setItem('isAuthenticated', 'true');
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    }
  };
  
  // Staff login (username + password)
  const loginStaff = async (username: string, password: string): Promise<{success: boolean, role?: string}> => {
    setIsLoading(true);
    
    try {
      console.log('Staff login attempt for:', username);
      const result = await authService.loginStaff(username, password);
      
      if (result.success && result.profile) {
        setUser({ id: result.profile.id });
        setProfile(result.profile);
        
        // Store auth info in localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(result.profile));
        localStorage.setItem('isAuthenticated', 'true');
        
        setIsLoading(false);
        return { success: true, role: result.profile.role };
      }
      
      setIsLoading(false);
      return { success: false };
    } catch (error: any) {
      console.error('Staff login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    try {
      console.log('Logging out user');
      
      // Clear auth state
      setUser(null);
      setProfile(null);
      
      // Remove from localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      
      navigate('/');
    } catch (err) {
      console.error('Unexpected error during logout:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loginStudent, loginStaff, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
