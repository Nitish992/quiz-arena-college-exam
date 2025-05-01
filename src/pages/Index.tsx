
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-quiz-light flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-quiz-primary mb-4">
            College Quiz Arena
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Welcome to the college's internal examination platform. Choose the appropriate portal to access quizzes, manage exams, or administer the system.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Student Portal</CardTitle>
              <CardDescription>Access your quizzes and view results</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="mb-6 flex-grow">
                Students can log in using their roll number and date of birth to take scheduled quizzes and check their performance.
              </p>
              <Button 
                className="w-full bg-quiz-primary hover:bg-quiz-secondary"
                onClick={() => navigate('/student-auth')}
              >
                Student Login
              </Button>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Staff Portal</CardTitle>
              <CardDescription>For administrators and faculty</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="mb-6 flex-grow">
                Administrators and teachers can log in to create quizzes, manage questions, view analytics, and administer the system.
              </p>
              <Button 
                className="w-full bg-quiz-secondary hover:bg-quiz-primary"
                onClick={() => navigate('/staff-auth')}
              >
                Staff Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
