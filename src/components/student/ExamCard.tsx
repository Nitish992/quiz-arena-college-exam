
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Quiz = {
  id: string;
  name: string;
  semester: string;
  subject_id: string;
  time_limit: number;
  start_time: string;
  end_time: string;
  instructions?: string;
  results_published: boolean;
  subject: {
    name: string;
  };
};

interface ExamCardProps {
  quiz: Quiz;
  isCompleted: boolean;
}

const ExamCard: React.FC<ExamCardProps> = ({ quiz, isCompleted }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  
  // Check if quiz is active (current time is between start and end time)
  const now = new Date();
  const startTime = new Date(quiz.start_time);
  const endTime = new Date(quiz.end_time);
  const isActive = now >= startTime && now <= endTime;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleStart = () => {
    setShowConfirmation(true);
  };

  const handleConfirmStart = () => {
    setShowConfirmation(false);
    navigate(`/student/quiz/${quiz.id}`);
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{quiz.name}</CardTitle>
            <Badge className={isCompleted ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-gray-500"}>
              {isCompleted ? "Completed" : isActive ? "Active" : "Not Active"}
            </Badge>
          </div>
          <CardDescription>
            Semester: {quiz.semester} | Subject: {quiz.subject.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time Limit:</span>
            <span className="font-medium">{quiz.time_limit} minutes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Available From:</span>
            <span className="font-medium">{formatDate(quiz.start_time)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Until:</span>
            <span className="font-medium">{formatDate(quiz.end_time)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleStart}
            disabled={isCompleted || !isActive} 
            className="w-full bg-quiz-primary hover:bg-quiz-secondary"
          >
            {isCompleted ? "View Results" : "Start Exam"}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ready to begin the exam?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>You are about to start: <strong>{quiz.name}</strong></p>
                <p>Subject: <strong>{quiz.subject.name}</strong></p>
                <p>Time limit: <strong>{quiz.time_limit} minutes</strong></p>
                {quiz.instructions && (
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mt-4">
                    <p className="font-medium text-amber-800 mb-2">Instructions:</p>
                    <p className="text-amber-700 text-sm">{quiz.instructions}</p>
                  </div>
                )}
                <p className="text-red-500 font-medium mt-4">
                  ⚠️ Once you start, the timer cannot be paused!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStart} className="bg-quiz-primary hover:bg-quiz-secondary">
              Start Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExamCard;
