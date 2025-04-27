
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import QuestionUpload from '@/components/teacher/QuestionUpload';
import QuizCreation from '@/components/teacher/QuizCreation';
import QuizList from '@/components/teacher/QuizList';
import Analytics from '@/components/teacher/Analytics';

const TeacherDashboard = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("quizzes");
  
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-quiz-primary">College Quiz Arena</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:inline">
              Faculty: {profile.name} ({profile.roll_number})
            </span>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="quizzes" className="px-4">Quizzes</TabsTrigger>
                <TabsTrigger value="questions" className="px-4">Questions</TabsTrigger>
                <TabsTrigger value="create" className="px-4">Create Quiz</TabsTrigger>
                <TabsTrigger value="analytics" className="px-4">Analytics</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="quizzes" className="space-y-6">
              <QuizList />
            </TabsContent>
            
            <TabsContent value="questions" className="space-y-6">
              <QuestionUpload />
            </TabsContent>
            
            <TabsContent value="create" className="space-y-6">
              <QuizCreation />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <Analytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
