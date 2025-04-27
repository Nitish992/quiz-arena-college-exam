
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_answer?: string;
};

interface QuizContextType {
  quizId: string | null;
  quizQuestions: Question[];
  currentQuestionIndex: number;
  timeRemaining: number;
  answers: Record<string, string>;
  isLoading: boolean;
  startQuiz: (quizId: string, timeLimit: number) => Promise<void>;
  setCurrentQuestion: (index: number) => void;
  updateAnswer: (questionId: string, answer: string) => void;
  submitQuiz: () => Promise<{ score: number, total: number }>;
  updateTimeRemaining: (time: number) => void;
  isQuizComplete: boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [quizId, setQuizId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const startQuiz = async (quizId: string, timeLimit: number) => {
    setIsLoading(true);
    setQuizId(quizId);
    
    try {
      // Fetch questions for this quiz
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          question:question_id (
            id,
            question,
            options
          )
        `)
        .eq('quiz_id', quizId);
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No questions found for this quiz');
      }
      
      // Format questions
      const formattedQuestions = data.map(item => ({
        id: item.question.id,
        question: item.question.question,
        options: item.question.options
      }));
      
      setQuizQuestions(formattedQuestions);
      setTimeRemaining(timeLimit * 60); // Convert minutes to seconds
      setCurrentQuestionIndex(0);
      setAnswers({});
      setIsQuizComplete(false);
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentQuestion = (index: number) => {
    if (index >= 0 && index < quizQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const updateAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = async (): Promise<{ score: number, total: number }> => {
    setIsLoading(true);
    
    try {
      if (!profile || !quizId) {
        throw new Error('User or quiz information missing');
      }
      
      // Submit quiz responses to Supabase
      const { error } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: quizId,
          user_id: profile.id,
          answers: answers,
          score: null // Score will be set by teacher later
        });
      
      if (error) {
        throw error;
      }
      
      setIsQuizComplete(true);
      
      // Return dummy score since we're not calculating it automatically
      return {
        score: 0,
        total: quizQuestions.length
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return {
        score: 0,
        total: quizQuestions.length
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTimeRemaining = (time: number) => {
    setTimeRemaining(time);
  };

  return (
    <QuizContext.Provider
      value={{
        quizId,
        quizQuestions,
        currentQuestionIndex,
        timeRemaining,
        answers,
        isLoading,
        startQuiz,
        setCurrentQuestion,
        updateAnswer,
        submitQuiz,
        updateTimeRemaining,
        isQuizComplete
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
