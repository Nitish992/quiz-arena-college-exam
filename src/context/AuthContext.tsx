
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { users } from '../lib/dummyData';

type User = {
  id: string;
  roll_number: string;
  role: string;
  name: string;
  semester?: string;
  batch?: string;
};

interface AuthContextType {
  user: User | null;
  login: (roll_number: string, dob: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('quizUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data', e);
        localStorage.removeItem('quizUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (roll_number: string, dob: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = users.find(u => 
      u.roll_number.toLowerCase() === roll_number.toLowerCase() && 
      (u.role === 'teacher' || u.role === 'admin' || u.dob_hash === dob)
    );
    
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        roll_number: foundUser.roll_number,
        role: foundUser.role,
        name: foundUser.name,
        semester: foundUser.semester,
        batch: foundUser.batch
      };
      
      setUser(userData);
      localStorage.setItem('quizUser', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quizUser');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
