
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type ResultType = {
  quiz: {
    id: string;
    name: string;
    semester: string;
    end_time: string;
    results_published: boolean;
    subject: {
      name: string;
    };
  };
  score: number | null;
  answers: Record<string, string>;
  submitted_at: string;
  total_questions: number;
};

const Results = () => {
  const { profile } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [results, setResults] = useState<ResultType[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!profile) return;
      
      setLoading(true);
      
      try {
        // Fetch all responses for this student with quiz details, including only published results
        const { data, error } = await supabase
          .from('quiz_responses')
          .select(`
            score,
            answers,
            submitted_at,
            quiz:quiz_id (
              id,
              name,
              semester,
              end_time,
              results_published,
              subject:subject_id (name)
            )
          `)
          .eq('user_id', profile.id)
          .order('submitted_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data) {
          setResults([]);
          setLoading(false);
          return;
        }
        
        // Filter only published results
        const publishedResults = data
          .filter(r => r.quiz.results_published)
          .map(r => ({
            ...r,
            total_questions: Object.keys(r.answers).length
          }));
        
        setResults(publishedResults);
        
        // Extract unique semesters
        const uniqueSemesters = Array.from(
          new Set(publishedResults.map(r => r.quiz.semester))
        );
        setSemesters(uniqueSemesters.sort());
        
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [profile]);
  
  // Filter results by semester
  const filteredResults = selectedSemester === "all" 
    ? results 
    : results.filter(r => r.quiz.semester === selectedSemester);
  
  if (!profile) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Results</h2>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesters.map(sem => (
              <SelectItem key={sem} value={sem}>{sem} Semester</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading your results...</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {results.length === 0 
              ? "You haven't completed any quizzes yet or no results have been published." 
              : "No results found for the selected semester."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResults.map(result => (
            <Card key={result.quiz.id} className="overflow-hidden">
              <div className={`h-2 ${
                result.score && result.total_questions && (result.score / result.total_questions) >= 0.7 
                  ? 'bg-green-500' 
                  : result.score && result.total_questions && (result.score / result.total_questions) >= 0.4 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
              }`}></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{result.quiz.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Subject: {result.quiz.subject.name}</p>
                    <p className="text-sm text-gray-500">Semester: {result.quiz.semester}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Date: {new Date(result.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-2xl font-bold">
                    {result.score !== null ? (
                      <>
                        {result.score}/{result.total_questions}
                        <p className="text-xs text-right text-gray-500">
                          {Math.round((result.score / result.total_questions) * 100)}%
                        </p>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
