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
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', data);
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
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile');
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
      console.log('Checking existing session:', session ? 'exists' : 'none');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('Existing session found, fetching profile');
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
      console.log('Student login attempt:', roll_number);
      
      // Check if this is a demo account in the range CS23A001-CS23A005
      if (roll_number.match(/^CS23A00[1-5]$/)) {
        // Generate email from roll number
        const email = `${roll_number.toLowerCase()}@example.com`;
        const password = dob.replace(/-/g, '') + roll_number; // Simple password generation
        
        console.log('Demo student account - email:', email, 'password (hashed):', '*'.repeat(password.length));
        
        // Try to sign in first to see if account exists
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        // If successful sign in, set user and profile
        if (!signInError && signInData.user) {
          console.log('Demo student account exists, signed in successfully');
          const userProfile = await fetchProfile(signInData.user.id);
          setProfile(userProfile);
          setIsLoading(false);
          return true;
        }
        
        // If sign in failed, try to create the account
        console.log('Demo account sign-in failed, creating new account:', signInError?.message);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
        
        if (signUpData.user) {
          // Sign in again after creation
          console.log('Demo account created, signing in again');
          const { data: finalSignInData, error: finalSignInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (finalSignInError) {
            console.error('Sign in error after creation:', finalSignInError);
            setIsLoading(false);
            return false;
          }
          
          console.log('Demo student login successful');
          const userProfile = await fetchProfile(finalSignInData.user.id);
          setProfile(userProfile);
          setIsLoading(false);
          return true;
        }
        
        console.warn('Failed to create or sign in demo student account');
        setIsLoading(false);
        return false;
      } else {
        // Regular login - check if roll number exists in profiles
        console.log('Regular student login with roll number:', roll_number);
        
        // Try to find student by roll number
        const { data: profileMatches, error: profileError } = await supabase
          .from('profiles')
          .select('id, roll_number')
          .eq('roll_number', roll_number);
            
        if (profileError || !profileMatches || profileMatches.length === 0) {
          console.error('Student not found:', profileError?.message || 'No matching records');
          setIsLoading(false);
          return false;
        }
        
        // Get the first matching profile
        const studentProfile = profileMatches[0];
        console.log('Found student profile:', studentProfile);
        
        // Get user email from auth (assuming convention: rollnumber@example.com)
        const email = `${roll_number.toLowerCase()}@example.com`;
        const password = dob.replace(/-/g, '') + roll_number; // Simple password generation
        
        console.log('Student found, attempting login with generated credentials');
        
        // Try to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Student login error:', error);
          setIsLoading(false);
          return false;
        }
        
        // Set profile and return success
        console.log('Student login successful');
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
    }
    
    setIsLoading(false);
    return false;
  };
  
  // Staff login (username + password)
  const loginStaff = async (username: string, password: string): Promise<{success: boolean, role?: string}> => {
    setIsLoading(true);
    
    try {
      console.log('Staff login attempt for:', username);
      // For demo users (admin001 and prof123)
      if (username === 'admin001' || username === 'prof123') {
        const email = `${username.toLowerCase()}@example.com`;
        const role = username === 'admin001' ? 'admin' : 'teacher';
        
        console.log('Demo staff account - email:', email, 'role:', role);
        
        // Try to sign in directly first
        try {
          console.log('Checking if demo staff account already exists');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          // If no error, user exists, set profile and return success
          if (!signInError && signInData.user) {
            console.log('Demo staff account exists, logged in successfully');
            const userProfile = await fetchProfile(signInData.user.id);
            setProfile(userProfile);
            setIsLoading(false);
            return { success: true, role };
          } else {
            console.log('Demo staff account does not exist or sign-in failed:', signInError?.message);
          }
        } catch (signInErr) {
          console.error('Error checking existing staff account:', signInErr);
        }
        
        // If login failed, create demo account
        console.log('Creating new demo staff account');
        try {
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
            console.error('Error creating demo staff account:', signUpError);
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
          console.log('Demo staff account created or already exists, signing in');
          const { data: finalSignInData, error: finalSignInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (finalSignInError) {
            console.error('Final staff sign in error:', finalSignInError);
            toast({
              title: "Login Failed",
              description: finalSignInError.message,
              variant: "destructive",
            });
            setIsLoading(false);
            return { success: false };
          }
          
          // Set profile and return success
          console.log('Demo staff login successful');
          const userProfile = await fetchProfile(finalSignInData.user.id);
          setProfile(userProfile);
          setIsLoading(false);
          return { success: true, role };
        } catch (err) {
          console.error('Error in staff account creation/login:', err);
        }
      } else {
        // Regular staff login flow
        console.log('Regular staff login attempt');
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
      }
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
    try {
      console.log('Logging out user');
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
      
      console.log('Logout successful');
      setUser(null);
      setProfile(null);
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
