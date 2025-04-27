
import React, { useState, useEffect } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const QuizInterface = () => {
  const { 
    quizQuestions, 
    currentQuestionIndex, 
    timeRemaining, 
    answers, 
    setCurrentQuestion, 
    updateAnswer,
    submitQuiz,
    updateTimeRemaining
  } = useQuiz();
  
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState({ score: 0, total: 0 });
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const { toast } = useToast();
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => {
        updateTimeRemaining(timeRemaining - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !showResults) {
      // Auto-submit when time expires
      handleSubmit();
      toast({
        title: "Time's up!",
        description: "Your answers have been automatically submitted.",
        variant: "destructive",
      });
    }
  }, [timeRemaining, showResults]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  
  const handleOptionSelect = (option: string) => {
    if (!showResults && currentQuestion) {
      updateAnswer(currentQuestion._id, option);
    }
  };
  
  const isOptionSelected = (option: string): boolean => {
    return currentQuestion && answers[currentQuestion._id] === option;
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
    return question && answers[question._id] !== undefined;
  };

  const handleSubmitClick = () => {
    const unansweredCount = quizQuestions.filter(q => !answers[q._id]).length;
    
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
    const result = await submitQuiz();
    setQuizResults(result);
    setShowResults(true);
  };

  if (!currentQuestion) {
    return <div>Loading questions...</div>;
  }

  if (showResults) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-quiz-primary">Quiz Complete!</h2>
          <div className="text-center mb-8">
            <div className="text-5xl font-bold mb-4">
              {quizResults.score} / {quizResults.total}
            </div>
            <p className="text-lg text-gray-700">
              You answered {quizResults.score} out of {quizResults.total} questions correctly.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button className="bg-quiz-primary hover:bg-quiz-secondary" onClick={() => window.location.href = '/student'}>
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
        <div className={`font-bold text-xl ${timeRemaining < 60 ? 'timer-expiring' : ''}`}>
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
                    className={`quiz-option ${isOptionSelected(String.fromCharCode(65 + index)) ? 'quiz-option-selected' : ''}`}
                    onClick={() => handleOptionSelect(String.fromCharCode(65 + index))}
                  >
                    <span className="w-8 h-8 rounded-full bg-quiz-light flex items-center justify-center mr-3 font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
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
                    className={`question-nav-button ${
                      isQuestionAttempted(index) ? 'question-attempted' : 'question-unattempted'
                    } ${currentQuestionIndex === index ? 'ring-2 ring-offset-2' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm">
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 bg-quiz-attempted rounded-full mr-2"></div>
                  Attempted
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-quiz-unattempted rounded-full mr-2"></div>
                  Unattempted
                </div>
              </div>
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSubmit} className="bg-quiz-primary">
              Yes, Submit
            </AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizInterface;
