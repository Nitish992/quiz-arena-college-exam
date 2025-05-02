
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';

const StudentLogin = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rollNumber || !dob) {
      toast({
        title: "Missing Information",
        description: "Please enter your roll number and date of birth",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log('Attempting student login with:', rollNumber, 'DOB format:', dob);
    
    try {
      // Use our local auth service that only depends on dummy data
      const result = await authService.loginStudent(rollNumber, dob);
      
      if (result.success) {
        console.log('Login successful, redirecting to student dashboard');
        // Store the user profile in localStorage for session management
        localStorage.setItem('currentUser', JSON.stringify(result.profile));
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/student');
      } else {
        console.log('Login failed, showing error message');
        toast({
          title: "Login Failed",
          description: result.error || `Invalid roll number or date of birth. For demo, use roll numbers CS23A001-CS23A005 with any date.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Student Portal</CardTitle>
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
              For demo: Use any date for CS23A001-CS23A005
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
          Student Access Portal
        </p>
      </CardFooter>
    </Card>
  );
};

export default StudentLogin;
