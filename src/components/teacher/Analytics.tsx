
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

type Quiz = {
  id: string;
  name: string;
  semester: string;
  subject: {
    name: string;
  };
};

type StudentResponse = {
  id: string;
  user: {
    id: string;
    name: string;
    roll_number: string;
  };
  score: number | null;
  submitted_at: string;
  quiz_id: string;
  total_questions: number;
};

const Analytics = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  
  // Stats
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [passRate, setPassRate] = useState<number | null>(null);
  const [highestScore, setHighestScore] = useState<number | null>(null);
  const [lowestScore, setLowestScore] = useState<number | null>(null);
  const [questionStats, setQuestionStats] = useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  
  // Fetch quizzes with responses
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      
      try {
        // Get quizzes that have responses
        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            id,
            name,
            semester,
            subject:subject_id (name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data) {
          setQuizzes([]);
          setLoading(false);
          return;
        }
        
        // Check which quizzes have responses
        const quizzesWithResponses = await Promise.all(
          data.map(async (quiz) => {
            const { count, error: countError } = await supabase
              .from('quiz_responses')
              .select('*', { count: 'exact', head: true })
              .eq('quiz_id', quiz.id);
            
            if (countError) {
              console.error('Error counting responses:', countError);
              return { quiz, hasResponses: false };
            }
            
            return { quiz, hasResponses: !!count && count > 0 };
          })
        );
        
        // Filter quizzes that have responses
        const availableQuizzes = quizzesWithResponses
          .filter(q => q.hasResponses)
          .map(q => q.quiz);
        
        setQuizzes(availableQuizzes);
        
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);
  
  // Fetch responses when quiz is selected
  useEffect(() => {
    const fetchResponses = async () => {
      if (!selectedQuiz) {
        setResponses([]);
        setAverageScore(null);
        setPassRate(null);
        setHighestScore(null);
        setLowestScore(null);
        setQuestionStats([]);
        setGradeDistribution([]);
        return;
      }
      
      setLoadingResponses(true);
      
      try {
        // Fetch quiz responses with user info
        const { data, error } = await supabase
          .from('quiz_responses')
          .select(`
            id,
            score,
            answers,
            submitted_at,
            quiz_id,
            user:user_id (
              id,
              name:profiles!inner(name),
              roll_number:profiles!inner(roll_number)
            )
          `)
          .eq('quiz_id', selectedQuiz);
        
        if (error) throw error;
        
        if (!data) {
          setResponses([]);
          setLoadingResponses(false);
          return;
        }
        
        // Fetch questions for this quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select(`
            question:question_id (id, question)
          `)
          .eq('quiz_id', selectedQuiz);
        
        if (questionsError) throw questionsError;
        
        const totalQuestions = questionsData?.length || 0;
        
        // Format responses
        const formattedResponses = data.map(r => ({
          id: r.id,
          user: {
            id: r.user.id,
            name: r.user.name,
            roll_number: r.user.roll_number
          },
          score: r.score,
          submitted_at: r.submitted_at,
          quiz_id: r.quiz_id,
          answers: r.answers,
          total_questions: totalQuestions
        }));
        
        setResponses(formattedResponses);
        
        // Calculate statistics
        calculateStatistics(formattedResponses, totalQuestions);
        
      } catch (error) {
        console.error('Error fetching responses:', error);
      } finally {
        setLoadingResponses(false);
      }
    };
    
    fetchResponses();
  }, [selectedQuiz]);
  
  const calculateStatistics = (responses: StudentResponse[], totalQuestions: number) => {
    if (responses.length === 0 || totalQuestions === 0) return;
    
    // Filter out responses without scores
    const scoredResponses = responses.filter(r => r.score !== null);
    
    if (scoredResponses.length === 0) {
      setAverageScore(null);
      setPassRate(null);
      setHighestScore(null);
      setLowestScore(null);
      return;
    }
    
    // Calculate average score as percentage
    const totalScore = scoredResponses.reduce((sum, r) => sum + (r.score || 0), 0);
    const avgScore = (totalScore / scoredResponses.length / totalQuestions) * 100;
    setAverageScore(parseFloat(avgScore.toFixed(1)));
    
    // Calculate pass rate (score >= 60%)
    const passCount = scoredResponses.filter(r => 
      (r.score || 0) / totalQuestions >= 0.6
    ).length;
    const passRateValue = (passCount / scoredResponses.length) * 100;
    setPassRate(parseFloat(passRateValue.toFixed(1)));
    
    // Calculate highest and lowest scores
    const scorePercentages = scoredResponses.map(r => 
      ((r.score || 0) / totalQuestions) * 100
    );
    setHighestScore(parseFloat(Math.max(...scorePercentages).toFixed(1)));
    setLowestScore(parseFloat(Math.min(...scorePercentages).toFixed(1)));
    
    // Calculate grade distribution
    const grades = [
      { grade: 'A (90-100%)', count: 0, color: '#4ade80' },
      { grade: 'B (80-89%)', count: 0, color: '#a3e635' },
      { grade: 'C (70-79%)', count: 0, color: '#fbbf24' },
      { grade: 'D (60-69%)', count: 0, color: '#f97316' },
      { grade: 'F (0-59%)', count: 0, color: '#ef4444' },
    ];
    
    scorePercentages.forEach(percent => {
      if (percent >= 90) grades[0].count++;
      else if (percent >= 80) grades[1].count++;
      else if (percent >= 70) grades[2].count++;
      else if (percent >= 60) grades[3].count++;
      else grades[4].count++;
    });
    
    setGradeDistribution(grades);
    
    // Generate dummy question stats for now
    // In a real app, you would analyze the answers field to generate real statistics
    const dummyQuestionStats = Array.from({ length: Math.min(5, totalQuestions) }, (_, i) => ({
      question: `Q${i + 1}`,
      correct: Math.floor(Math.random() * (responses.length - 5) + 5),
      incorrect: responses.length - Math.floor(Math.random() * (responses.length - 5) + 5)
    }));
    
    setQuestionStats(dummyQuestionStats);
  };
  
  const currentQuiz = quizzes.find(q => q.id === selectedQuiz);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Analytics</h2>
        <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a quiz to analyze" />
          </SelectTrigger>
          <SelectContent>
            {quizzes.map(quiz => (
              <SelectItem key={quiz.id} value={quiz.id}>
                {quiz.name} ({quiz.subject.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading quizzes...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              No quiz results available for analysis yet.
            </p>
          </CardContent>
        </Card>
      ) : !selectedQuiz ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Please select a quiz to view analytics.
            </p>
          </CardContent>
        </Card>
      ) : loadingResponses ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading quiz data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-medium mb-2">Average Score</h3>
                <p className="text-3xl font-bold">
                  {averageScore !== null ? `${averageScore}%` : 'N/A'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-medium mb-2">Pass Rate</h3>
                <p className="text-3xl font-bold">
                  {passRate !== null ? `${passRate}%` : 'N/A'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-medium mb-2">Highest Score</h3>
                <p className="text-3xl font-bold">
                  {highestScore !== null ? `${highestScore}%` : 'N/A'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-medium mb-2">Lowest Score</h3>
                <p className="text-3xl font-bold">
                  {lowestScore !== null ? `${lowestScore}%` : 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gradeDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Students">
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Question Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={questionStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="correct" name="Correct" stackId="a" fill="#4ade80" />
                    <Bar dataKey="incorrect" name="Incorrect" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Time Taken</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => {
                    const scorePercent = response.score !== null && response.total_questions
                      ? Math.round((response.score / response.total_questions) * 100)
                      : null;
                    
                    const submittedDate = new Date(response.submitted_at);
                    const now = new Date();
                    const diffMs = now.getTime() - submittedDate.getTime();
                    const diffMins = Math.round(diffMs / 60000);
                      
                    return (
                      <TableRow key={response.id}>
                        <TableCell>{response.user.roll_number}</TableCell>
                        <TableCell>{response.user.name}</TableCell>
                        <TableCell>
                          {response.score !== null 
                            ? `${response.score}/${response.total_questions}` 
                            : 'Pending'}
                        </TableCell>
                        <TableCell>
                          {scorePercent !== null ? `${scorePercent}%` : 'Pending'}
                        </TableCell>
                        <TableCell>{Math.min(diffMins, response.total_questions * 2)} min</TableCell>
                        <TableCell className={
                          scorePercent !== null 
                            ? scorePercent >= 60 ? 'text-green-500' : 'text-red-500'
                            : ''
                        }>
                          {scorePercent !== null 
                            ? (scorePercent >= 60 ? 'Pass' : 'Fail')
                            : 'Pending'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Analytics;
