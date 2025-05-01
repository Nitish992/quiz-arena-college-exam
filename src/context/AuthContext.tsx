
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

type ProfileType = {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  roll_number?: string;
  semester?: string;
  batch?: string;
  dob?: string;
};

interface AuthContextType {
  user: User | null;
  profile: ProfileType | null;
  loginStudent: (roll_number: string, dob: string) => Promise<boolean>;
  loginStaff: (username: string, password: string) => Promise<{success: boolean, role?: string}>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user profile data from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as ProfileType;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Student login (roll number + DOB)
  const loginStudent = async (roll_number: string, dob: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For demo - if this is a test account in the range CS23A001-CS23A005, create it on-the-fly
      if (roll_number.startsWith('CS23A') && parseInt(roll_number.slice(4)) <= 5) {
        // Generate email from roll number
        const email = `${roll_number.toLowerCase()}@example.com`;
        const password = dob.replace(/-/g, '') + roll_number; // Simple password generation
        
        // Check if account exists first
        const { data: existingUser } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (existingUser.user) {
          // User already exists, set profile and return success
          const userProfile = await fetchProfile(existingUser.user.id);
          setProfile(userProfile);
          setIsLoading(false);
          return true;
        }
        
        // Try to create demo account
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: `Student ${roll_number}`,
              role: 'student',
              roll_number: roll_number,
              semester: '6th',
              batch: '2023-26',
              dob: dob
            }
          }
        });
        
        if (signUpError) {
          console.error('Error creating student account:', signUpError);
          toast({
            title: "Registration Error",
            description: signUpError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
        
        if (data.user) {
          // Sign in immediately
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (signInError) {
            console.error('Sign in error after creation:', signInError);
            toast({
              title: "Login Failed",
              description: signInError.message,
              variant: "destructive",
            });
            setIsLoading(false);
            return false;
          }
          
          // Set profile data and return success
          const userProfile = await fetchProfile(signInData.user.id);
          setProfile(userProfile);
          setIsLoading(false);
          return true;
        }
      } else {
        // Regular login - check if roll number exists in profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('roll_number', roll_number)
          .single();
          
        if (profileError || !profileData) {
          console.error('Student not found:', profileError);
          toast({
            title: "Login Failed",
            description: "Invalid roll number",
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
        
        // Get user email from auth (assuming convention: rollnumber@example.com)
        const email = `${roll_number.toLowerCase()}@example.com`;
        const password = dob.replace(/-/g, '') + roll_number; // Simple password generation
        
        // Try to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Student login error:', error);
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
        
        // Set profile and return success
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
        setIsLoading(false);
        return true;
      }
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
    
    setIsLoading(false);
    return false;
  };
  
  // Staff login (username + password)
  const loginStaff = async (username: string, password: string): Promise<{success: boolean, role?: string}> => {
    setIsLoading(true);
    
    try {
      // For demo users (admin001 and prof123)
      if (username === 'admin001' || username === 'prof123') {
        const email = `${username.toLowerCase()}@example.com`;
        const role = username === 'admin001' ? 'admin' : 'teacher';
        
        // Try to sign in directly first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        // If no error, user exists, set profile and return success
        if (!signInError && signInData.user) {
          const userProfile = await fetchProfile(signInData.user.id);
          setProfile(userProfile);
          setIsLoading(false);
          return { success: true, role };
        }
        
        // If login failed, create demo account (but don't report error to user for demo)
        if (signInError && signInError.message !== 'Invalid login credentials') {
          console.error("Login error:", signInError);
          toast({
            title: "Login Error",
            description: signInError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return { success: false };
        }
        
        // User doesn't exist, create demo account
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: username === 'admin001' ? 'Admin User' : 'Professor Smith',
              role,
              roll_number: username,
              username
            }
          }
        });
        
        if (signUpError && !signUpError.message.includes('already registered')) {
          console.error('Error creating demo account:', signUpError);
          toast({
            title: "Account Error",
            description: signUpError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return { success: false };
        }
        
        // If here, either account was created or already existed
        // Try to sign in again
        const { data: finalSignInData, error: finalSignInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (finalSignInError) {
          console.error('Final sign in error:', finalSignInError);
          toast({
            title: "Login Failed",
            description: finalSignInError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return { success: false };
        }
        
        // Set profile and return success
        const userProfile = await fetchProfile(finalSignInData.user.id);
        setProfile(userProfile);
        setIsLoading(false);
        return { success: true, role };
      }
      
      // For regular staff users
      // Look up username in staff_credentials
      const { data: credData, error: credError } = await supabase
        .from('staff_credentials')
        .select(`
          id,
          username,
          profiles (
            role
          )
        `)
        .eq('username', username)
        .single();
      
      if (credError || !credData) {
        console.error('Staff lookup error:', credError);
        toast({
          title: "Login Failed",
          description: "Invalid username",
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false };
      }
      
      // Get user email from auth
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(credData.id);
      
      if (authError || !authData?.user?.email) {
        console.error('Auth lookup error:', authError);
        toast({
          title: "Login Failed",
          description: "User account not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false };
      }
      
      // Try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authData.user.email,
        password,
      });
      
      if (error) {
        console.error('Staff sign in error:', error);
        toast({
          title: "Login Failed",
          description: "Invalid password",
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false };
      }
      
      // Get staff role
      const role = (credData.profiles as any).role;
      
      // Set profile and return success
      const userProfile = await fetchProfile(data.user.id);
      setProfile(userProfile);
      setIsLoading(false);
      return { success: true, role };
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

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    setUser(null);
    setProfile(null);
    navigate('/');
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
