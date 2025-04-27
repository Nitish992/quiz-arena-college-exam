
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ExamCard from '@/components/student/ExamCard';
import Results from '@/components/student/Results';
import { quizzes, results } from '@/lib/dummyData';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("exams");
  
  if (!user) return null;

  // Filter quizzes for this student's semester
  const studentQuizzes = quizzes.filter(quiz => quiz.semester === user.semester);
  
  // Check which quizzes are completed
  const completedQuizIds = new Set(
    results
      .filter(r => r.roll_number === user.roll_number)
      .map(r => r.quiz_id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-quiz-primary">College Quiz Arena</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:inline">
              {user.name} ({user.roll_number}) | {user.semester} Semester
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
                <TabsTrigger value="exams" className="px-4">Exams</TabsTrigger>
                <TabsTrigger value="results" className="px-4">Results</TabsTrigger>
              </TabsList>
              <div className="md:hidden text-sm">
                {user.name} | {user.semester} Sem
              </div>
            </div>
            
            <TabsContent value="exams" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Available Exams</h2>
                <span className="text-sm text-gray-500">
                  {studentQuizzes.length} exams for {user.semester} Semester
                </span>
              </div>
              
              {studentQuizzes.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No exams are available for your semester at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentQuizzes.map(quiz => (
                    <ExamCard
                      key={quiz._id}
                      quiz={quiz}
                      isCompleted={completedQuizIds.has(quiz._id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="results">
              <Results />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
