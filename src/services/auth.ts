
import { supabase } from '@/integrations/supabase/client';
import { databaseService } from './database';
import { ProfileType } from '@/types/auth';

// This service encapsulates authentication logic
export interface AuthResult {
  success: boolean;
  user?: any;
  profile?: ProfileType | null;
  error?: string;
}

export const authService = {
  // Student login with roll number and DOB
  loginStudent: async (rollNumber: string, dob: string): Promise<AuthResult> => {
    console.log('Student login attempt:', rollNumber);
    
    try {
      // Check if this is a demo account in the range CS23A001-CS23A005
      const isDemoAccount = rollNumber.match(/^CS23A00[1-5]$/);
      const email = `${rollNumber.toLowerCase()}@example.com`;
      const password = dob.replace(/-/g, '') + rollNumber; // Simple password generation
      
      console.log('Attempting login with email:', email);
      
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // If successful sign in
      if (!signInError && signInData.user) {
        console.log('Login successful, fetching profile');
        
        // Find the profile in the database
        const profile = await databaseService.findProfileById(signInData.user.id);
        
        return { 
          success: true, 
          user: signInData.user,
          profile 
        };
      }
      
      // If not a demo account and sign in failed, return error
      if (!isDemoAccount) {
        console.error('Login failed:', signInError?.message);
        return { 
          success: false, 
          error: 'Invalid roll number or DOB' 
        };
      }
      
      // For demo accounts, try to create the account if login failed
      console.log('Demo account sign-in failed, creating new account:', signInError?.message);
      
      // Create the auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: `Student ${rollNumber}`,
            role: 'student',
            roll_number: rollNumber,
            semester: '6th',
            batch: '2023-26',
            dob: dob
          }
        }
      });
      
      if (signUpError) {
        console.error('Error creating student account:', signUpError);
        return { 
          success: false, 
          error: signUpError.message 
        };
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
          return { 
            success: false, 
            error: finalSignInError.message 
          };
        }
        
        console.log('Demo student login successful');
        const profile = await databaseService.findProfileById(finalSignInData.user.id);
        
        return { 
          success: true, 
          user: finalSignInData.user,
          profile 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to create or sign in demo account' 
      };
    } catch (error: any) {
      console.error('Login exception:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  }
};
