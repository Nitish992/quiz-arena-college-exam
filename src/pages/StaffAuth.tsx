
import React from 'react';
import StaffLogin from '../components/StaffLogin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StaffAuth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-quiz-light flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-quiz-primary">
              College Quiz Arena
            </h1>
            <p className="text-lg text-gray-700">
              Welcome to the college's internal examination platform for administrators and teachers.
              Log in with your username and password to manage quizzes and view results.
            </p>
            <div className="flex gap-4 mt-6">
              <Card className="w-full p-2 border-l-4 border-l-quiz-secondary">
                <CardHeader className="p-2">
                  <CardTitle className="text-sm">Staff Portal</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <CardDescription>For administrators and faculty members</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <StaffLogin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAuth;
