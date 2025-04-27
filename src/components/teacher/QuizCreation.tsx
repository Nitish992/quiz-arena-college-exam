
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { questions as allQuestions, semesters } from '@/lib/dummyData';

const QuizCreation = () => {
  const [quizName, setQuizName] = useState('');
  const [semester, setSemester] = useState('');
  const [timeLimit, setTimeLimit] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  
  // Filter questions based on selected semester
  const semesterQuestions = semester ? 
    allQuestions.filter(q => q.semester === semester) : [];

  const handleCheckQuestion = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, id]);
    } else {
      setSelectedQuestions(selectedQuestions.filter(q => q !== id));
    }
  };
  
  const handleSelectAll = () => {
    if (selectedQuestions.length === semesterQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(semesterQuestions.map(q => q._id));
    }
  };

  const handleCreateQuiz = () => {
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
    
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      toast({
        title: "Quiz Created",
        description: `${quizName} has been created with ${selectedQuestions.length} questions`,
      });
      
      // Reset form
      setQuizName('');
      setSemester('');
      setTimeLimit('30');
      setStartDate('');
      setEndDate('');
      setInstructions('');
      setSelectedQuestions([]);
    }, 1500);
  };

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
          
          {semester && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Select Questions</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedQuestions.length === semesterQuestions.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              {semesterQuestions.length === 0 ? (
                <div className="text-center p-4 border rounded-md">
                  No questions available for this semester
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
                      {semesterQuestions.map((question) => (
                        <TableRow key={question._id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedQuestions.includes(question._id)} 
                              onCheckedChange={(checked) => 
                                handleCheckQuestion(question._id, checked as boolean)
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
