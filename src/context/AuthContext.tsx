
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
      // Check if the roll number exists in our system
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('roll_number', roll_number)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error checking roll number:', profileError);
        toast({
          title: "Login Error",
          description: "An error occurred while checking credentials.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      // If profile doesn't exist or is not a student
      if (!profileData || profileData.role !== 'student') {
        // For demo purposes, create a student account if roll number starts with CS23A
        if (roll_number.startsWith('CS23A')) {
          const email = `${roll_number.toLowerCase()}@example.com`;
          const password = dob.replace(/-/g, '') + roll_number; // Simple password generation
          
          // Try to create account
          return await createStudentAccount(roll_number, dob, email, password);
        }
        
        toast({
          title: "Access Denied",
          description: "Invalid student credentials.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      // If profile exists, attempt sign in
      const email = `${roll_number.toLowerCase()}@example.com`;
      const password = dob.replace(/-/g, '') + roll_number; // Simple password generation
      
      return await signInWithEmailPassword(email, password);
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
      // For demo simplicity
      if (username === 'admin001' || username === 'prof123') {
        const email = `${username.toLowerCase()}@example.com`;
        const role = username === 'admin001' ? 'admin' : 'teacher';
        
        // Try to create demo account if it doesn't exist
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('roll_number', username)
          .maybeSingle();
        
        if (!profileData) {
          // Create demo account
          const { error: signUpError } = await supabase.auth.signUp({
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
          
          if (signUpError) {
            if (!signUpError.message.includes('User already registered')) {
              console.error('Error creating demo account:', signUpError);
              toast({
                title: "Account Error",
                description: signUpError.message,
                variant: "destructive",
              });
              setIsLoading(false);
              return { success: false };
            }
          }
        }
        
        // Sign in
        const signInSuccess = await signInWithEmailPassword(email, password);
        setIsLoading(false);
        return { success: signInSuccess, role };
      }
      
      // For regular staff
      const { data: userData, error: userError } = await supabase
        .from('staff_credentials')
        .select(`
          id,
          username,
          profiles:id (
            role
          )
        `)
        .eq('username', username)
        .single();
      
      if (userError || !userData) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false };
      }
      
      // Get email from user_id
      const { data: authData } = await supabase.auth.admin.getUserById(userData.id);
      
      if (!authData?.user?.email) {
        toast({
          title: "Login Failed",
          description: "User account not configured correctly",
          variant: "destructive",
        });
        setIsLoading(false);
        return { success: false };
      }
      
      // Sign in with email and password
      const signInSuccess = await signInWithEmailPassword(authData.user.email, password);
      
      if (!signInSuccess) {
        setIsLoading(false);
        return { success: false };
      }
      
      const role = (userData.profiles as any).role;
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
  
  // Helper function to create a student account
  const createStudentAccount = async (roll_number: string, dob: string, email: string, password: string): Promise<boolean> => {
    const { error: signUpError } = await supabase.auth.signUp({
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
      // If user already exists, try to sign in
      if (signUpError.message.includes('User already registered')) {
        return await signInWithEmailPassword(email, password);
      }
      
      toast({
        title: "Registration Error",
        description: signUpError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
    
    toast({
      title: "Account Created",
      description: "Your account has been created. Please log in.",
    });
    
    return await signInWithEmailPassword(email, password);
  };
  
  // Helper function to sign in with email and password
  const signInWithEmailPassword = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
    
    // Fetch user profile
    const userProfile = await fetchProfile(data.user.id);
    setProfile(userProfile);
    setIsLoading(false);
    return true;
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
