
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Quiz = {
  id: string;
  name: string;
  semester: string;
  end_time: string;
  time_limit: number;
  results_published: boolean;
  subject: { name: string };
  _count?: {
    quiz_questions: number;
  };
};

const QuizList = () => {
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch quizzes and count questions
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      
      try {
        // First, get all quizzes with subject info
        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            id, 
            name, 
            semester, 
            end_time, 
            time_limit, 
            results_published,
            subject:subject_id (name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data) {
          setQuizzes([]);
          setLoading(false);
          return;
        }
        
        // Get question counts for each quiz
        const quizzesWithCounts = await Promise.all(data.map(async (quiz) => {
          const { count, error: countError } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id);
          
          if (countError) {
            console.error('Error counting questions for quiz:', countError);
            return { ...quiz, _count: { quiz_questions: 0 } };
          }
          
          return { ...quiz, _count: { quiz_questions: count || 0 } };
        }));
        
        setQuizzes(quizzesWithCounts);
        
        // Extract unique semesters
        const uniqueSemesters = Array.from(new Set(data.map(q => q.semester)));
        setSemesters(uniqueSemesters.sort());
        
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast({
          title: "Error",
          description: "Failed to load quizzes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [toast]);
  
  // Filter quizzes by semester
  const filteredQuizzes = selectedSemester === "all" 
    ? quizzes 
    : quizzes.filter(q => q.semester === selectedSemester);
  
  const handleTogglePublished = async (quizId: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ results_published: published })
        .eq('id', quizId);
      
      if (error) throw error;
      
      // Update local state
      setQuizzes(quizzes.map(quiz => 
        quiz.id === quizId 
          ? { ...quiz, results_published: published } 
          : quiz
      ));
      
      toast({
        title: published ? "Results Published" : "Results Hidden",
        description: `Results for this quiz are now ${published ? "visible" : "hidden"} to students`,
      });
      
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update quiz status",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manage Quizzes</CardTitle>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map(sem => (
                <SelectItem key={sem} value={sem}>{sem}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading quizzes...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center p-4">
            No quizzes found for the selected semester.
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Publish Results</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.name}</TableCell>
                    <TableCell>{quiz.subject?.name}</TableCell>
                    <TableCell>{quiz.semester}</TableCell>
                    <TableCell>{formatDate(quiz.end_time)}</TableCell>
                    <TableCell>{quiz.time_limit} min</TableCell>
                    <TableCell>{quiz._count?.quiz_questions || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Switch 
                          checked={quiz.results_published} 
                          onCheckedChange={(checked) => handleTogglePublished(quiz.id, checked)}
                        />
                        <span className="ml-2 text-sm">
                          {quiz.results_published ? 'Published' : 'Hidden'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizList;
