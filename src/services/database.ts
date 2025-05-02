
import { ProfileType } from '@/types/auth';
import { users } from '@/lib/dummyData';

// This service layer abstracts database operations
// When migrating to MySQL, only this file would need to be changed

export interface DatabaseService {
  findStudentByRollNumber: (rollNumber: string) => Promise<ProfileType | null>;
  createStudent: (profile: Omit<ProfileType, 'id'>) => Promise<ProfileType | null>;
  findProfileById: (userId: string) => Promise<ProfileType | null>;
}

// Implementation using dummy data - can be replaced with MySQL implementation later
export const databaseService: DatabaseService = {
  findStudentByRollNumber: async (rollNumber: string): Promise<ProfileType | null> => {
    console.log('Searching for student with roll number:', rollNumber);
    
    try {
      // Find student in dummy data
      const user = users.find(u => u.roll_number === rollNumber);
      
      if (!user) {
        console.log('Student not found with roll number:', rollNumber);
        return null;
      }
      
      // Map dummy data user to ProfileType
      const profile: ProfileType = {
        id: user.id,
        name: user.name,
        role: user.role,
        roll_number: user.roll_number,
        semester: user.semester,
        batch: user.batch,
        dob: user.dob_hash
      };
      
      console.log('Student found:', profile);
      return profile;
    } catch (error) {
      console.error('Exception finding student:', error);
      return null;
    }
  },
  
  createStudent: async (profile: Omit<ProfileType, 'id'>): Promise<ProfileType | null> => {
    console.log('Creating new student profile:', profile);
    
    try {
      // Generate a simple ID (in production you'd use UUID)
      const id = `u${users.length + 1}`;
      
      // Create new profile
      const newProfile: ProfileType = {
        id,
        ...profile
      };
      
      // In a real implementation, we would add this to the database
      // For now we just log it since we're using static data
      console.log('Created student profile:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Exception creating student:', error);
      return null;
    }
  },
  
  findProfileById: async (userId: string): Promise<ProfileType | null> => {
    console.log('Finding profile for user:', userId);
    
    try {
      // Find user in dummy data
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        console.log('User not found with id:', userId);
        return null;
      }
      
      // Map dummy data user to ProfileType
      const profile: ProfileType = {
        id: user.id,
        name: user.name,
        role: user.role,
        roll_number: user.roll_number,
        semester: user.semester,
        batch: user.batch,
        dob: user.dob_hash
      };
      
      console.log('Profile found:', profile);
      return profile;
    } catch (error) {
      console.error('Exception finding profile:', error);
      return null;
    }
  }
};
