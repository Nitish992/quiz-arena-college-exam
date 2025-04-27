
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { quizzes, results } from '@/lib/dummyData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  
  // Filter quizzes that have results
  const availableQuizzes = quizzes.filter(quiz => 
    results.some(r => r.quiz_id === quiz._id)
  );
  
  const currentQuiz = availableQuizzes.find(q => q._id === selectedQuiz);
  
  // Dummy analytics data
  const quizResults = selectedQuiz ? [
    { grade: 'A (90-100%)', count: 5, color: '#4ade80' },
    { grade: 'B (80-89%)', count: 8, color: '#a3e635' },
    { grade: 'C (70-79%)', count: 12, color: '#fbbf24' },
    { grade: 'D (60-69%)', count: 4, color: '#f97316' },
    { grade: 'F (0-59%)', count: 3, color: '#ef4444' },
  ] : [];
  
  const questionPerformance = selectedQuiz ? [
    { question: 'Q1', correct: 25, incorrect: 7 },
    { question: 'Q2', correct: 18, incorrect: 14 },
    { question: 'Q3', correct: 22, incorrect: 10 },
    { question: 'Q4', correct: 16, incorrect: 16 },
    { question: 'Q5', correct: 27, incorrect: 5 },
  ] : [];
  
  const COLORS = ['#4ade80', '#ef4444'];
  
  // Dummy summary statistics
  const averageScore = 76.5;
  const passRate = 87.5;
  const highestScore = 98;
  const lowestScore = 42;
  
  if (availableQuizzes.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">
            No quiz results available for analysis yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Analytics</h2>
        <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a quiz to analyze" />
          </SelectTrigger>
          <SelectContent>
            {availableQuizzes.map(quiz => (
              <SelectItem key={quiz._id} value={quiz._id}>
                {quiz.name} ({quiz.semester})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {!selectedQuiz ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              Please select a quiz to view analytics.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-medium mb-2">Average Score</h3>
                <p className="text-3xl font-bold">{averageScore}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-medium mb-2">Pass Rate</h3>
                <p className="text-3xl font-bold">{passRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-medium mb-2">Highest Score</h3>
                <p className="text-3xl font-bold">{highestScore}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-lg font-medium mb-2">Lowest Score</h3>
                <p className="text-3xl font-bold">{lowestScore}%</p>
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
                    data={quizResults}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Students" fill="#9b87f5">
                      {quizResults.map((entry, index) => (
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
                    data={questionPerformance}
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
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Time Taken (min)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 'CS23A001', score: '18/20', percent: 90, time: 24, status: 'Pass' },
                    { id: 'CS23A002', score: '15/20', percent: 75, time: 28, status: 'Pass' },
                    { id: 'CS23A003', score: '17/20', percent: 85, time: 19, status: 'Pass' },
                    { id: 'CS23A004', score: '12/20', percent: 60, time: 30, status: 'Pass' },
                    { id: 'CS23A005', score: '8/20', percent: 40, time: 27, status: 'Fail' },
                  ].map((student, i) => (
                    <TableRow key={i}>
                      <TableCell>{student.id}</TableCell>
                      <TableCell>{student.score}</TableCell>
                      <TableCell>{student.percent}%</TableCell>
                      <TableCell>{student.time}</TableCell>
                      <TableCell className={student.status === 'Pass' ? 'text-green-500' : 'text-red-500'}>
                        {student.status}
                      </TableCell>
                    </TableRow>
                  ))}
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
