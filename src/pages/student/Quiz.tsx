
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuiz, QuizProvider } from '@/context/QuizContext';
import QuizInterface from '@/components/student/QuizInterface';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const QuizWrapper = () => {
  const { startQuiz } = useQuiz();
  const { quizId } = useParams<{ quizId: string }>();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadQuiz = async () => {
      if (quizId && profile) {
        try {
          // Check if this quiz exists and is for the user's semester
          const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .single();
          
          if (quizError) {
            toast({
              title: "Quiz not found",
              description: "The requested quiz doesn't exist or has been removed.",
              variant: "destructive",
            });
            navigate('/student');
            return;
          }
          
          if (quiz.semester !== profile.semester) {
            toast({
              title: "Access Denied",
              description: "This quiz is not available for your semester.",
              variant: "destructive",
            });
            navigate('/student');
            return;
          }
          
          // Check if student has already completed this quiz
          const { data: response, error: responseError } = await supabase
            .from('quiz_responses')
            .select('*')
            .eq('quiz_id', quizId)
            .eq('user_id', profile.id)
            .maybeSingle();
          
          if (responseError) {
            console.error('Error checking for previous attempts:', responseError);
          }
          
          if (response) {
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
        } catch (error) {
          console.error('Error loading quiz:', error);
          toast({
            title: "Error",
            description: "An error occurred while loading the quiz.",
            variant: "destructive",
          });
          navigate('/student');
        }
      }
    };
    
    loadQuiz();
  }, [quizId, profile, navigate, startQuiz, toast]);
  
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
