
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
};

interface AuthContextType {
  user: User | null;
  profile: ProfileType | null;
  login: (roll_number: string, dob: string) => Promise<boolean>;
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

  const login = async (roll_number: string, dob: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // First check if the roll number exists in our system
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
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
      
      // For simplicity in this demo, we'll use roll_number@example.com as the email
      // In a real system, you would have a proper mapping between roll numbers and email addresses
      const email = `${roll_number.toLowerCase()}@example.com`;
      const password = dob.replace(/-/g, '') + roll_number; // Simple password generation
      
      // If profile doesn't exist but it's one of our demo accounts, create it
      if (!profileData && (roll_number === 'prof123' || roll_number === 'admin001' || roll_number.startsWith('CS23A'))) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: roll_number === 'prof123' ? 'Professor Smith' : roll_number === 'admin001' ? 'Admin User' : `Student ${roll_number}`,
              role: roll_number === 'prof123' ? 'teacher' : roll_number === 'admin001' ? 'admin' : 'student',
              roll_number: roll_number,
              semester: roll_number === 'prof123' || roll_number === 'admin001' ? null : '6th',
              batch: roll_number === 'prof123' || roll_number === 'admin001' ? null : '2023-26'
            }
          }
        });
        
        if (signUpError) {
          console.error('Error signing up:', signUpError);
          // If user already exists, try to sign in
          if (signUpError.message.includes('User already registered')) {
            return attemptSignIn(email, password);
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
        
        return attemptSignIn(email, password);
      } else if (profileData) {
        // If profile exists, attempt sign in
        return attemptSignIn(email, password);
      } else {
        toast({
          title: "Invalid Credentials",
          description: "The provided roll number was not found.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
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
  };
  
  const attemptSignIn = async (email: string, password: string): Promise<boolean> => {
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
    <AuthContext.Provider value={{ user, profile, login, logout, isLoading }}>
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
