import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  GameSection, 
  GameState, 
  GameConfig, 
  ScoringConfig,
  QuizSectionContent,
  QuizQuestion 
} from "../../../../../shared/game-schema";
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  ArrowRight,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizRendererProps {
  section: GameSection;
  gameState: GameState;
  config: GameConfig;
  scoring: ScoringConfig;
  onAnswer: (
    sectionId: string,
    itemId: string,
    answer: unknown,
    isCorrect: boolean,
    pointsEarned: number,
    timeSpent: number
  ) => void;
  onComplete: () => void;
  onUseHint: () => boolean;
}

export function QuizRenderer({
  section,
  gameState,
  config,
  scoring,
  onAnswer,
  onComplete,
  onUseHint,
}: QuizRendererProps) {
  const content = section.content as QuizSectionContent;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number | null>(null);

  const currentQuestion = content.questions[currentIndex];
  const totalQuestions = content.questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setTextAnswer("");
    setShowResult(false);
    setShowHint(false);
    setQuestionStartTime(Date.now());
    
    const timeLimit = currentQuestion.timeLimit || config.questionTimeLimit;
    setQuestionTimeRemaining(timeLimit > 0 ? timeLimit : null);
  }, [currentIndex, currentQuestion.timeLimit, config.questionTimeLimit]);

  // Question timer
  useEffect(() => {
    if (questionTimeRemaining === null || showResult) return;
    
    if (questionTimeRemaining <= 0) {
      handleSubmit(null);
      return;
    }

    const timer = setInterval(() => {
      setQuestionTimeRemaining(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTimeRemaining, showResult]);

  const checkAnswer = (answer: unknown): boolean => {
    const correct = currentQuestion.correctAnswer;
    
    if (currentQuestion.questionType === "text-input") {
      const normalizedAnswer = String(answer).toLowerCase().trim();
      const normalizedCorrect = String(correct).toLowerCase().trim();
      return normalizedAnswer === normalizedCorrect;
    }
    
    if (currentQuestion.questionType === "multiple-choice") {
      if (Array.isArray(correct) && Array.isArray(answer)) {
        return correct.length === answer.length && 
          correct.every(c => answer.includes(c));
      }
    }
    
    return answer === correct;
  };

  const handleSubmit = (answer: unknown) => {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const correct = answer !== null && checkAnswer(answer);
    const points = correct ? currentQuestion.points : 0;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    onAnswer(
      section.id,
      currentQuestion.id,
      answer,
      correct,
      points,
      timeSpent
    );
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    
    if (currentQuestion.questionType === "single-choice" || 
        currentQuestion.questionType === "true-false") {
      setSelectedAnswer(index);
      // Auto-submit for single choice
      setTimeout(() => handleSubmit(index), 300);
    } else {
      // Multiple choice - toggle selection
      setSelectedAnswer(prev => {
        if (prev === null) return [index] as number[];
        if (Array.isArray(prev)) {
          const newArr = prev.includes(index)
            ? prev.filter(i => i !== index)
            : [...prev, index];
          return newArr as number[];
        }
        return [index] as number[];
      });
    }
  };

  const handleTextSubmit = () => {
    if (textAnswer.trim()) {
      handleSubmit(textAnswer.trim());
    }
  };

  const handleHint = () => {
    if (onUseHint()) {
      setShowHint(true);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        {questionTimeRemaining !== null && (
          <div className={cn(
            "flex items-center gap-1 text-sm",
            questionTimeRemaining <= 5 && "text-red-500"
          )}>
            <Clock className="h-4 w-4" />
            {questionTimeRemaining}s
          </div>
        )}
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1"
      >
        {/* Question text */}
        <h2 className="text-xl font-semibold mb-6">
          {currentQuestion.question}
        </h2>

        {/* Media content */}
        {currentQuestion.media && (
          <div className="mb-6">
            {currentQuestion.media.type === "image" && (
              <img 
                src={currentQuestion.media.content} 
                alt={currentQuestion.media.caption || "Question image"}
                className="max-w-full rounded-xl"
              />
            )}
            {currentQuestion.media.type === "code" && (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                <code>{currentQuestion.media.content}</code>
              </pre>
            )}
          </div>
        )}

        {/* Hint */}
        {config.hintsEnabled && currentQuestion.hint && !showHint && !showResult && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHint}
            className="mb-4"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Use Hint ({gameState.hints} left)
          </Button>
        )}

        {showHint && currentQuestion.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4"
          >
            <p className="text-sm text-amber-800">
              <Lightbulb className="h-4 w-4 inline mr-2" />
              {currentQuestion.hint}
            </p>
          </motion.div>
        )}

        {/* Options for choice questions */}
        {(currentQuestion.questionType === "single-choice" || 
          currentQuestion.questionType === "multiple-choice" ||
          currentQuestion.questionType === "true-false") && 
          currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = Array.isArray(selectedAnswer)
                ? selectedAnswer.includes(index)
                : selectedAnswer === index;
              const isCorrectOption = Array.isArray(currentQuestion.correctAnswer)
                ? currentQuestion.correctAnswer.includes(index)
                : currentQuestion.correctAnswer === index;

              return (
                <motion.button
                  key={option.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showResult}
                  className={cn(
                    "w-full p-4 rounded-xl text-left transition-all",
                    "border-2",
                    !showResult && !isSelected && "bg-white border-gray-200 hover:border-gray-300",
                    !showResult && isSelected && "bg-primary/10 border-primary",
                    showResult && isCorrectOption && "bg-green-50 border-green-500",
                    showResult && isSelected && !isCorrectOption && "bg-red-50 border-red-500",
                    showResult && !isSelected && !isCorrectOption && "opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    {showResult && isCorrectOption && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Text input for text questions */}
        {currentQuestion.questionType === "text-input" && (
          <div className="space-y-4">
            <Input
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={showResult}
              className="h-12 text-lg"
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            />
            {!showResult && (
              <Button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim()}
                className="w-full h-12"
              >
                Submit Answer
              </Button>
            )}
          </div>
        )}

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "mt-6 p-4 rounded-xl",
                isCorrect ? "bg-green-50" : "bg-red-50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-700">Correct!</span>
                    <span className="text-green-600 text-sm">
                      +{currentQuestion.points} points
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-semibold text-red-700">Incorrect</span>
                  </>
                )}
              </div>
              
              {currentQuestion.explanation && (
                <p className={cn(
                  "text-sm",
                  isCorrect ? "text-green-700" : "text-red-700"
                )}>
                  {currentQuestion.explanation}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Next button */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Button
            onClick={handleNext}
            className="w-full h-12"
          >
            {isLastQuestion ? "Complete" : "Next Question"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
