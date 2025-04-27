
import React from 'react';
import Login from '../components/Login';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-quiz-light flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-quiz-primary">
              College Quiz Arena
            </h1>
            <p className="text-lg text-gray-700">
              Welcome to the college's internal examination platform. Log in with your credentials to access quizzes, manage exams, or administer the system.
            </p>
            <div className="flex gap-4 mt-6">
              <Card className="w-full p-2 border-l-4 border-l-quiz-primary">
                <CardHeader className="p-2">
                  <CardTitle className="text-sm">For Students</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <CardDescription>Use your roll number and date of birth</CardDescription>
                </CardContent>
              </Card>
              <Card className="w-full p-2 border-l-4 border-l-quiz-secondary">
                <CardHeader className="p-2">
                  <CardTitle className="text-sm">For Faculty</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <CardDescription>Use your faculty ID and password</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <Login />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
