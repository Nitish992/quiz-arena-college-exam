
import React, { useState, useEffect } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

const QuizInterface = () => {
  const { 
    quizQuestions, 
    currentQuestionIndex, 
    timeRemaining, 
    answers, 
    setCurrentQuestion, 
    updateAnswer,
    submitQuiz,
    updateTimeRemaining,
    isLoading,
    isQuizComplete
  } = useQuiz();
  
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !isQuizComplete && !isLoading) {
      const timer = setTimeout(() => {
        updateTimeRemaining(timeRemaining - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isQuizComplete && !isLoading) {
      // Auto-submit when time expires
      handleSubmit();
      toast({
        title: "Time's up!",
        description: "Your answers have been automatically submitted.",
        variant: "destructive",
      });
    }
  }, [timeRemaining, isQuizComplete, isLoading, updateTimeRemaining, toast]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  
  const handleOptionSelect = (option: string) => {
    if (!isQuizComplete && currentQuestion) {
      updateAnswer(currentQuestion.id, option);
    }
  };
  
  const isOptionSelected = (option: string): boolean => {
    return currentQuestion && answers[currentQuestion.id] === option;
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const isQuestionAttempted = (index: number): boolean => {
    const question = quizQuestions[index];
    return question && answers[question.id] !== undefined;
  };

  const handleSubmitClick = () => {
    const unansweredCount = quizQuestions.filter(q => !answers[q.id]).length;
    
    if (unansweredCount > 0) {
      toast({
        title: "Unanswered Questions",
        description: `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`,
        variant: "destructive",
      });
    }
    
    setShowSubmitDialog(true);
  };

  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    await submitQuiz();
    navigate('/student');
    toast({
      title: "Quiz Submitted",
      description: "Your quiz has been submitted successfully. Results will be available once the teacher has published them.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-2">Loading questions...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Error</h2>
          <p className="text-center mb-8">
            No questions found for this quiz. Please contact your instructor.
          </p>
          <div className="flex justify-center">
            <Button 
              className="bg-quiz-primary hover:bg-quiz-secondary" 
              onClick={() => navigate('/student')}
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow">
        <div className="font-semibold">
          Question {currentQuestionIndex + 1} of {quizQuestions.length}
        </div>
        <div className={`font-bold text-xl ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : ''}`}>
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Question and options */}
        <div className="md:w-3/4">
          <Card className="mb-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isOptionSelected(String.fromCharCode(65 + index)) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleOptionSelect(String.fromCharCode(65 + index))}
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            {currentQuestionIndex < quizQuestions.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmitClick} className="bg-green-500 hover:bg-green-600">
                Submit Quiz
              </Button>
            )}
          </div>
        </div>

        {/* Question navigator */}
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {quizQuestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleJumpToQuestion(index)}
                    className={`h-8 w-8 rounded flex items-center justify-center text-sm ${
                      isQuestionAttempted(index) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    } ${currentQuestionIndex === index ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm">
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  Attempted
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 rounded-full mr-2"></div>
                  Unattempted
                </div>
              </div>
              
              <Button 
                onClick={handleSubmitClick} 
                className="w-full mt-4 bg-green-500 hover:bg-green-600"
              >
                Submit Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your answers? You won't be able to change them after submission.
              <p className="mt-2">Your results will be available after the teacher has published them.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-quiz-primary">
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizInterface;
