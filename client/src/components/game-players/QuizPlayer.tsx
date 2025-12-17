import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import type { QuizContent } from "@shared/game-content";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  content: QuizContent;
  onComplete: (score: number) => void;
}

export function QuizPlayer({ content, onComplete }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const question = content.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / content.questions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowFeedback(true);
    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < content.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setIsComplete(true);
      onComplete(score + (selectedAnswer === question.correctAnswer ? 1 : 0));
    }
  };

  if (isComplete) {
    const finalScore = score + (selectedAnswer === question.correctAnswer ? 1 : 0);
    const percentage = (finalScore / content.questions.length) * 100;
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-mint-100 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-mint-600" />
        </div>
        <div>
          <h2 className="text-3xl font-black mb-2">Quiz Complete!</h2>
          <p className="text-xl text-muted-foreground">
            You scored <span className="font-bold text-mint-600">{finalScore}</span> out of{" "}
            <span className="font-bold">{content.questions.length}</span>
          </p>
          <p className="text-lg text-muted-foreground mt-2">{percentage.toFixed(0)}% Correct</p>
        </div>
        <div className="w-full max-w-md">
          <Progress value={percentage} className="h-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestion + 1} of {content.questions.length}</span>
          <span>Score: {score}/{content.questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card className="p-6 bg-gradient-to-br from-mint-50 to-cream-50 border-mint-200">
        <h3 className="text-xl font-bold mb-4">{question.question}</h3>
      </Card>

      {/* Options */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswer;
          const showCorrect = showFeedback && isCorrect;
          const showIncorrect = showFeedback && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showFeedback}
              className={cn(
                "w-full p-4 rounded-2xl border-2 text-left transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                !showFeedback && !isSelected && "bg-white border-gray-200 hover:border-mint-300 hover:bg-mint-50",
                !showFeedback && isSelected && "bg-mint-100 border-mint-400",
                showCorrect && "bg-green-100 border-green-400",
                showIncorrect && "bg-red-100 border-red-400",
                showFeedback && "cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option}</span>
                {showCorrect && <CheckCircle2 className="text-green-600" size={24} />}
                {showIncorrect && <XCircle className="text-red-600" size={24} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showFeedback && question.explanation && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!showFeedback ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full rounded-full h-12 text-lg font-bold"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full rounded-full h-12 text-lg font-bold"
          >
            {currentQuestion < content.questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}
