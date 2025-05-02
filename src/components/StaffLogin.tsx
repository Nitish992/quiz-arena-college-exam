
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

const StaffLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { loginStaff } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Attempting staff login with:', username);
      
      // For demo users, log more information
      if (username === 'admin001' || username === 'prof123') {
        console.log('Using demo account for staff:', username);
      }
      
      const { success, role } = await loginStaff(username, password);
      console.log('Login result:', success, 'role:', role);
      
      if (success) {
        console.log('Login successful, redirecting to role-specific dashboard');
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'teacher') {
          navigate('/teacher');
        } else {
          toast({
            title: "Access Denied",
            description: "You do not have staff privileges",
            variant: "destructive",
          });
        }
      } else {
        console.log('Login failed, showing error message');
        toast({
          title: "Login Failed",
          description: "Invalid username or password. For demo, use admin001 or prof123 with any password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Staff login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Staff Portal</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access the administrative portal</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              For demo: Use "admin001" (admin) or "prof123" (teacher) as username with any password
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-quiz-primary hover:bg-quiz-secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center w-full text-gray-500">
          Administration Access Portal
        </p>
      </CardFooter>
    </Card>
  );
};

export default StaffLogin;
