
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuiz, QuizProvider } from '@/context/QuizContext';
import QuizInterface from '@/components/student/QuizInterface';
import { quizzes, results } from '@/lib/dummyData';
import { useToast } from '@/components/ui/use-toast';

const QuizWrapper = () => {
  const { startQuiz } = useQuiz();
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadQuiz = async () => {
      if (quizId && user) {
        // Check if this quiz exists and is for the user's semester
        const quiz = quizzes.find(q => q._id === quizId);
        
        // Check if student has already completed this quiz
        const alreadyCompleted = results.some(
          r => r.quiz_id === quizId && r.roll_number === user.roll_number
        );
        
        if (!quiz) {
          toast({
            title: "Quiz not found",
            description: "The requested quiz doesn't exist or has been removed.",
            variant: "destructive",
          });
          navigate('/student');
          return;
        }
        
        if (quiz.semester !== user.semester) {
          toast({
            title: "Access Denied",
            description: "This quiz is not available for your semester.",
            variant: "destructive",
          });
          navigate('/student');
          return;
        }
        
        if (alreadyCompleted) {
          toast({
            title: "Quiz Already Completed",
            description: "You have already taken this quiz.",
            variant: "destructive",
          });
          navigate('/student');
          return;
        }
        
        // Check if quiz is active
        const now = new Date();
        const startTime = new Date(quiz.start_time);
        const endTime = new Date(quiz.end_time);
        
        if (now < startTime || now > endTime) {
          toast({
            title: "Quiz Not Active",
            description: "This quiz is not currently available.",
            variant: "destructive",
          });
          navigate('/student');
          return;
        }
        
        await startQuiz(quizId, quiz.time_limit);
        setIsLoading(false);
      }
    };
    
    loadQuiz();
  }, [quizId, user, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quiz-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  return <QuizInterface />;
};

const QuizPage = () => {
  return (
    <QuizProvider>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto">
          <QuizWrapper />
        </div>
      </div>
    </QuizProvider>
  );
};

export default QuizPage;
