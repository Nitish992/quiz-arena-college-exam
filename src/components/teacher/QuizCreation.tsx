
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

type Question = {
  id: string;
  question: string;
  subject_id: string;
  semester: string;
};

type Subject = {
  id: string;
  name: string;
  semester: string;
};

const QuizCreation = () => {
  const [quizName, setQuizName] = useState('');
  const [semester, setSemester] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [timeLimit, setTimeLimit] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch subjects and semesters
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: "Error",
          description: "Failed to load subjects",
          variant: "destructive",
        });
        return;
      }
      
      setSubjects(data || []);
      
      // Extract unique semesters
      const uniqueSemesters = Array.from(new Set(data?.map(s => s.semester) || []));
      setSemesters(uniqueSemesters.sort());
    };
    
    fetchSubjects();
  }, [toast]);
  
  // Fetch questions when semester and subject are selected
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!semester || !subjectId) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('id, question, subject_id, semester')
          .eq('semester', semester)
          .eq('subject_id', subjectId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setQuestions(data || []);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Error",
          description: "Failed to load questions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [semester, subjectId, toast]);

  const handleCheckQuestion = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, id]);
    } else {
      setSelectedQuestions(selectedQuestions.filter(q => q !== id));
    }
  };
  
  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  const handleCreateQuiz = async () => {
    // Validate form
    if (!quizName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a quiz name",
        variant: "destructive",
      });
      return;
    }
    
    if (!semester) {
      toast({
        title: "Missing Information",
        description: "Please select a semester",
        variant: "destructive",
      });
      return;
    }
    
    if (!subjectId) {
      toast({
        title: "Missing Information",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }
    
    if (!timeLimit || parseInt(timeLimit) <= 0) {
      toast({
        title: "Invalid Time Limit",
        description: "Please enter a valid time limit",
        variant: "destructive",
      });
      return;
    }
    
    if (!startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedQuestions.length === 0) {
      toast({
        title: "No Questions Selected",
        description: "Please select at least one question",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Insert quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert([
          {
            name: quizName,
            semester: semester,
            subject_id: subjectId,
            time_limit: parseInt(timeLimit),
            start_time: new Date(startDate).toISOString(),
            end_time: new Date(endDate).toISOString(),
            instructions: instructions,
            results_published: false
          }
        ])
        .select()
        .single();
      
      if (quizError) throw quizError;
      
      // Insert quiz questions
      const quizQuestions = selectedQuestions.map(questionId => ({
        quiz_id: quizData.id,
        question_id: questionId
      }));
      
      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(quizQuestions);
      
      if (questionsError) throw questionsError;
      
      toast({
        title: "Quiz Created",
        description: `${quizName} has been created with ${selectedQuestions.length} questions`,
      });
      
      // Reset form
      setQuizName('');
      setSemester('');
      setSubjectId('');
      setTimeLimit('30');
      setStartDate('');
      setEndDate('');
      setInstructions('');
      setSelectedQuestions([]);
      
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Error Creating Quiz",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Filter subjects based on selected semester
  const semesterSubjects = semester 
    ? subjects.filter(s => s.semester === semester)
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quiz Name</label>
              <Input 
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)} 
                placeholder="e.g., Midterm Database Exam"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map(sem => (
                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select 
                value={subjectId} 
                onValueChange={setSubjectId} 
                disabled={!semester}
              >
                <SelectTrigger>
                  <SelectValue placeholder={semester ? "Select subject" : "Select semester first"} />
                </SelectTrigger>
                <SelectContent>
                  {semesterSubjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Limit (minutes)</label>
              <Input 
                type="number" 
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)} 
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date & Time</label>
              <Input 
                type="datetime-local" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date & Time</label>
              <Input 
                type="datetime-local" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Instructions</label>
            <Textarea 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)} 
              placeholder="Enter instructions for students..."
              rows={3}
            />
          </div>
          
          {subjectId && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Select Questions</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={loading || questions.length === 0}
                >
                  {selectedQuestions.length === questions.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center p-4 border rounded-md">
                  {semester && subjectId 
                    ? "No questions available for this subject and semester. Please upload questions first." 
                    : "Please select a semester and subject to view questions"}
                </div>
              ) : (
                <div className="border rounded-md h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Question</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedQuestions.includes(question.id)} 
                              onCheckedChange={(checked) => 
                                handleCheckQuestion(question.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>{question.question}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                {selectedQuestions.length} question(s) selected
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleCreateQuiz} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? 'Creating Quiz...' : 'Create Quiz'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCreation;
