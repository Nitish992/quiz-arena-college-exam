
import { databaseService } from './database';
import { ProfileType } from '@/types/auth';
import { users } from '@/lib/dummyData';

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
      
      // Find the student profile
      const profile = await databaseService.findStudentByRollNumber(rollNumber);
      
      // If student found and DOB matches or it's a demo account
      if (profile && (profile.dob === dob || isDemoAccount)) {
        console.log('Login successful');
        
        return { 
          success: true, 
          user: { id: profile.id }, // Simplified user object
          profile 
        };
      }
      
      // If not found or mismatch and not a demo account, return error
      if (!isDemoAccount) {
        console.error('Login failed: Invalid roll number or DOB');
        return { 
          success: false, 
          error: 'Invalid roll number or DOB' 
        };
      }
      
      // For demo accounts, create a new profile
      console.log('Demo account not found, creating new account');
      
      // Create new demo profile
      const newProfile = await databaseService.createStudent({
        name: `Student ${rollNumber}`,
        role: 'student',
        roll_number: rollNumber,
        semester: '6th',
        batch: '2023-26',
        dob: dob
      });
      
      if (!newProfile) {
        console.error('Error creating demo student account');
        return { 
          success: false, 
          error: 'Failed to create demo account' 
        };
      }
      
      console.log('Demo student login successful');
      return { 
        success: true, 
        user: { id: newProfile.id },
        profile: newProfile 
      };
    } catch (error: any) {
      console.error('Login exception:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  },
  
  // Staff login function (not implemented in this example)
  loginStaff: async (username: string, password: string): Promise<AuthResult> => {
    console.log('Staff login attempt:', username);
    
    try {
      // For demo users (admin001 and prof123)
      if (username === 'admin001' || username === 'prof123') {
        const role = username === 'admin001' ? 'admin' : 'teacher';
        const demoUser = users.find(u => u.roll_number === username);
        
        if (demoUser) {
          // Create profile from dummy data
          const profile: ProfileType = {
            id: demoUser.id,
            name: demoUser.name,
            role: demoUser.role, 
            roll_number: demoUser.roll_number
          };
          
          return {
            success: true,
            user: { id: demoUser.id },
            profile: profile
          };
        }
        
        // Create a simple profile if not found in dummy data
        return {
          success: true,
          user: { id: `staff_${Date.now()}` },
          profile: {
            id: `staff_${Date.now()}`,
            name: username === 'admin001' ? 'Admin User' : 'Professor Smith',
            role: role,
            roll_number: username
          }
        };
      }
      
      return {
        success: false,
        error: 'Invalid credentials'
      };
    } catch (error: any) {
      console.error('Staff login exception:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
};
