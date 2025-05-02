
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from '@/types/auth';

// This service layer abstracts database operations
// When migrating to MySQL, only this file would need to be changed

export interface DatabaseService {
  findStudentByRollNumber: (rollNumber: string) => Promise<ProfileType | null>;
  createStudent: (profile: Omit<ProfileType, 'id'>) => Promise<ProfileType | null>;
  findProfileById: (userId: string) => Promise<ProfileType | null>;
}

// Implementation using Supabase - can be replaced with MySQL implementation later
export const databaseService: DatabaseService = {
  findStudentByRollNumber: async (rollNumber: string): Promise<ProfileType | null> => {
    console.log('Searching for student with roll number:', rollNumber);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('roll_number', rollNumber)
        .maybeSingle();
        
      if (error) {
        console.error('Error finding student by roll number:', error);
        return null;
      }
      
      console.log('Student search result:', data);
      return data as ProfileType | null;
    } catch (error) {
      console.error('Exception finding student:', error);
      return null;
    }
  },
  
  createStudent: async (profile: Omit<ProfileType, 'id'>): Promise<ProfileType | null> => {
    console.log('Creating new student profile:', profile);
    
    try {
      // Get the user ID from auth
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        console.error('No authenticated user to create profile for');
        return null;
      }
      
      const newProfile = {
        id: authData.user.id,
        ...profile
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating student profile:', error);
        return null;
      }
      
      console.log('Created student profile:', data);
      return data as ProfileType;
    } catch (error) {
      console.error('Exception creating student:', error);
      return null;
    }
  },
  
  findProfileById: async (userId: string): Promise<ProfileType | null> => {
    console.log('Finding profile for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error finding profile:', error);
        return null;
      }
      
      console.log('Profile found:', data);
      return data as ProfileType;
    } catch (error) {
      console.error('Exception finding profile:', error);
      return null;
    }
  }
};
