
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { quizzes as allQuizzes, semesters } from '@/lib/dummyData';

const QuizList = () => {
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [quizzes, setQuizzes] = useState(allQuizzes);
  const { toast } = useToast();
  
  // Filter quizzes by semester
  const filteredQuizzes = selectedSemester === "all" 
    ? quizzes 
    : quizzes.filter(q => q.semester === selectedSemester);
  
  const handleTogglePublished = (quizId: string, published: boolean) => {
    setQuizzes(quizzes.map(quiz => 
      quiz._id === quizId 
        ? { ...quiz, results_published: published } 
        : quiz
    ));
    
    toast({
      title: published ? "Results Published" : "Results Hidden",
      description: `Results for this quiz are now ${published ? "visible" : "hidden"} to students`,
    });
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
        {filteredQuizzes.length === 0 ? (
          <div className="text-center p-4">
            No quizzes found for the selected semester.
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz Name</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Publish Results</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz) => (
                  <TableRow key={quiz._id}>
                    <TableCell className="font-medium">{quiz.name}</TableCell>
                    <TableCell>{quiz.semester}</TableCell>
                    <TableCell>{formatDate(quiz.end_time)}</TableCell>
                    <TableCell>{quiz.time_limit} min</TableCell>
                    <TableCell>{quiz.total_questions}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Switch 
                          checked={quiz.results_published} 
                          onCheckedChange={(checked) => handleTogglePublished(quiz._id, checked)}
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
