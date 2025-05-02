
export type ProfileType = {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  roll_number?: string;
  semester?: string;
  batch?: string;
  dob?: string;
};

export interface AuthContextType {
  user: any | null;
  profile: ProfileType | null;
  loginStudent: (roll_number: string, dob: string) => Promise<boolean>;
  loginStaff: (username: string, password: string) => Promise<{success: boolean, role?: string}>;
  logout: () => void;
  isLoading: boolean;
}
