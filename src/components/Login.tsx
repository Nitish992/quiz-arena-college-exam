
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { loginStudent, loginStaff } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rollNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter your roll number",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine if this is a staff or student login based on the roll number format
      if (rollNumber.toLowerCase() === 'admin001' || rollNumber.toLowerCase() === 'prof123') {
        // For staff login (using password as dob for simplicity)
        const { success, role } = await loginStaff(rollNumber, dob);
        
        if (success) {
          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'teacher') {
            navigate('/teacher');
          }
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid credentials",
            variant: "destructive",
          });
        }
      } else {
        // For student login
        const success = await loginStudent(rollNumber, dob);
        
        if (success) {
          navigate('/student');
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid roll number or date of birth",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
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
        <CardTitle className="text-2xl font-bold text-center">Quiz Arena</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access the exam portal</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <Input
              id="rollNumber"
              placeholder="e.g., CS23A001"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              For demo: Use any date for prof123, admin001, or CS23A001-CS23A005
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
          College Internal Quiz System
        </p>
      </CardFooter>
    </Card>
  );
};

export default Login;
