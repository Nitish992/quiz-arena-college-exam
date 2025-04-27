
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ExamCard from '@/components/student/ExamCard';
import Results from '@/components/student/Results';
import { supabase } from '@/integrations/supabase/client';

type Quiz = {
  id: string;
  name: string;
  semester: string;
  subject_id: string;
  time_limit: number;
  start_time: string;
  end_time: string;
  instructions: string;
  results_published: boolean;
  subject: {
    name: string;
  };
};

type QuizResponse = {
  quiz_id: string;
  user_id: string;
  score: number | null;
};

const StudentDashboard = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("exams");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [completedQuizIds, setCompletedQuizIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!profile) return;
      
      setLoading(true);
      
      try {
        // Fetch quizzes for student's semester
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select(`
            id, 
            name, 
            semester, 
            subject_id, 
            time_limit, 
            start_time,
            end_time,
            instructions,
            results_published,
            subject:subject_id (name)
          `)
          .eq('semester', profile.semester);
        
        if (quizError) throw quizError;
        setQuizzes(quizData || []);
        
        // Fetch completed quizzes
        const { data: responseData, error: responseError } = await supabase
          .from('quiz_responses')
          .select('quiz_id, user_id, score')
          .eq('user_id', profile.id);
        
        if (responseError) throw responseError;
        
        // Create a Set of completed quiz IDs
        const completedIds = new Set((responseData || []).map((r: QuizResponse) => r.quiz_id));
        setCompletedQuizIds(completedIds);
        
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [profile]);
  
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-quiz-primary">College Quiz Arena</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:inline">
              {profile.name} ({profile.roll_number}) | {profile.semester} Semester
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
                {profile.name} | {profile.semester} Sem
              </div>
            </div>
            
            <TabsContent value="exams" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Available Exams</h2>
                <span className="text-sm text-gray-500">
                  {quizzes.length} exams for {profile.semester} Semester
                </span>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading exams...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No exams are available for your semester at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map(quiz => (
                    <ExamCard
                      key={quiz.id}
                      quiz={quiz}
                      isCompleted={completedQuizIds.has(quiz.id)}
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
