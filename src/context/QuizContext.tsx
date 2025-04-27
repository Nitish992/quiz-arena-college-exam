
import React, { createContext, useContext, useState } from 'react';
import { questions } from '../lib/dummyData';

type Question = {
  _id: string;
  question: string;
  options: string[];
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
    
    // Simulate API call to get questions for this quiz
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, we'd fetch questions using the quiz ID
    // For this demo, we'll just use our dummy questions
    setQuizQuestions(questions);
    setTimeRemaining(timeLimit * 60); // Convert minutes to seconds
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsQuizComplete(false);
    setIsLoading(false);
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
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Calculate score (for demo purposes)
    let score = 0;
    quizQuestions.forEach(q => {
      const correctAnswer = questions.find(question => question._id === q._id)?.correct_answer;
      if (correctAnswer && answers[q._id] === correctAnswer) {
        score++;
      }
    });
    
    setIsQuizComplete(true);
    setIsLoading(false);
    
    return {
      score,
      total: quizQuestions.length
    };
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
