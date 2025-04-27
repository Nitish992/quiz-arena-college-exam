
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { quizzes, results, users } from '@/lib/dummyData';
import { useAuth } from '@/context/AuthContext';

const Results = () => {
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  
  if (!user) return null;
  
  // Get unique semesters
  const userSemesters = new Set<string>();
  if (user.semester) {
    userSemesters.add(user.semester);
  }
  
  // Filter results for this student
  const userResults = results.filter(r => r.roll_number === user.roll_number);
  
  // Get quizzes for these results
  const resultQuizzes = userResults.map(r => {
    const quiz = quizzes.find(q => q._id === r.quiz_id);
    if (quiz) {
      userSemesters.add(quiz.semester);
      return {
        ...quiz,
        score: r.score,
        total: r.total_questions
      };
    }
    return null;
  }).filter(Boolean);
  
  // Filter by semester if selected
  const filteredQuizzes = selectedSemester === "all" 
    ? resultQuizzes 
    : resultQuizzes.filter(q => q?.semester === selectedSemester);
  
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
            {Array.from(userSemesters).map(sem => (
              <SelectItem key={sem} value={sem}>{sem} Semester</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No results found for the selected semester.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map(quiz => quiz && (
            <Card key={quiz._id} className="overflow-hidden">
              <div className={`h-2 ${quiz.score / quiz.total >= 0.7 ? 'bg-green-500' : quiz.score / quiz.total >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{quiz.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Semester: {quiz.semester}</p>
                    <p className="text-sm text-gray-500 mt-1">Date: {new Date(quiz.end_time).toLocaleDateString()}</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {quiz.score}/{quiz.total}
                    <p className="text-xs text-right text-gray-500">
                      {Math.round((quiz.score / quiz.total) * 100)}%
                    </p>
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
