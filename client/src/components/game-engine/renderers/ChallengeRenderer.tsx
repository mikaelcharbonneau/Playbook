import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  GameSection, 
  GameState, 
  GameConfig, 
  ScoringConfig,
  ChallengeSectionContent,
  ChallengeItem
} from "../../../../../shared/game-schema";
import { 
  Clock,
  Zap,
  Trophy,
  XCircle,
  CheckCircle,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeRendererProps {
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

export function ChallengeRenderer({
  section,
  gameState,
  scoring,
  onAnswer,
  onComplete,
}: ChallengeRendererProps) {
  const content = section.content as ChallengeSectionContent;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(content.timeLimit);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [startTime] = useState(Date.now());
  const [streak, setStreak] = useState(0);

  const currentItem = content.items[currentIndex];

  // Timer
  useEffect(() => {
    if (isGameOver) return;
    
    if (timeRemaining <= 0) {
      endGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isGameOver]);

  const endGame = useCallback(() => {
    const passed = score >= content.targetScore;
    setIsGameOver(true);
    setGameResult(passed ? "win" : "lose");
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onAnswer(
      section.id,
      section.id,
      { score, mistakes, timeSpent },
      passed,
      score,
      timeSpent
    );
  }, [score, content.targetScore, mistakes, startTime, section.id, onAnswer]);

  // Check for game over conditions
  useEffect(() => {
    if (isGameOver) return;
    
    if (mistakes >= content.maxMistakes && content.maxMistakes > 0) {
      endGame();
    }
  }, [mistakes, content.maxMistakes, isGameOver, endGame]);

  const checkAnswer = (answer: string | number) => {
    const correct = String(answer).toLowerCase().trim() === 
                   String(currentItem.correctAnswer).toLowerCase().trim();
    
    if (correct) {
      const timeBonus = currentItem.timeBonus && timeRemaining > content.timeLimit / 2
        ? currentItem.timeBonus
        : 0;
      const streakBonus = streak >= 2 ? Math.floor(currentItem.points * 0.2) : 0;
      const totalPoints = currentItem.points + timeBonus + streakBonus;
      
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
      setShowFeedback("correct");
    } else {
      setMistakes(prev => prev + 1);
      setStreak(0);
      setShowFeedback("wrong");
    }

    // Move to next item after brief feedback
    setTimeout(() => {
      setShowFeedback(null);
      setTextAnswer("");
      
      if (currentIndex < content.items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        endGame();
      }
    }, 500);
  };

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;
    checkAnswer(option);
  };

  const handleTextSubmit = () => {
    if (!textAnswer.trim() || showFeedback) return;
    checkAnswer(textAnswer);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isGameOver) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-6",
            gameResult === "win" ? "bg-green-100" : "bg-red-100"
          )}
        >
          {gameResult === "win" ? (
            <Trophy className="h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500" />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">
          {gameResult === "win" ? "Challenge Complete!" : "Time's Up!"}
        </h2>
        
        <p className="text-muted-foreground mb-6 text-center">
          {gameResult === "win" 
            ? "Great job! You beat the challenge!"
            : `You needed ${content.targetScore} points to pass.`}
        </p>

        <div className="bg-white rounded-xl p-4 mb-6 w-full max-w-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Final Score:</span>
            <span className="font-bold text-xl">{score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target:</span>
            <span>{content.targetScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mistakes:</span>
            <span>{mistakes} / {content.maxMistakes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Questions:</span>
            <span>{currentIndex + 1} / {content.items.length}</span>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full max-w-sm h-12">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header stats */}
      <div className="flex items-center justify-between mb-4">
        {/* Timer */}
        <div className={cn(
          "flex items-center gap-1 px-3 py-1 rounded-full",
          timeRemaining <= 10 ? "bg-red-100 text-red-600" : "bg-gray-100"
        )}>
          <Clock className="h-4 w-4" />
          <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="font-bold">{score}</span>
          <span className="text-xs text-muted-foreground">/ {content.targetScore}</span>
        </div>

        {/* Lives/Mistakes */}
        {content.maxMistakes > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: content.maxMistakes }).map((_, i) => (
              <Heart
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < content.maxMistakes - mistakes
                    ? "text-red-500 fill-red-500"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <Progress 
        value={(currentIndex / content.items.length) * 100} 
        className="h-2 mb-4"
      />

      {/* Streak indicator */}
      {streak >= 2 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-1 mb-4"
        >
          <Zap className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-500">{streak}x Streak!</span>
        </motion.div>
      )}

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md text-center"
          >
            {/* Points indicator */}
            <div className="mb-4">
              <span className="text-xs text-muted-foreground">
                +{currentItem.points} points
                {currentItem.timeBonus && ` (+${currentItem.timeBonus} speed bonus)`}
              </span>
            </div>

            {/* Prompt */}
            <h2 className="text-2xl font-bold mb-8">
              {currentItem.prompt}
            </h2>

            {/* Options or text input */}
            {currentItem.options ? (
              <div className="grid grid-cols-2 gap-3">
                {currentItem.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    disabled={!!showFeedback}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "p-4 rounded-xl border-2 font-medium transition-all",
                      !showFeedback && "bg-white border-gray-200 hover:border-primary",
                      showFeedback === "correct" && option === String(currentItem.correctAnswer) && 
                        "bg-green-100 border-green-500",
                      showFeedback === "wrong" && option === String(currentItem.correctAnswer) && 
                        "bg-green-100 border-green-500"
                    )}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="h-14 text-xl text-center"
                  onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                  autoFocus
                />
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textAnswer.trim()}
                  className="w-full h-12"
                >
                  Submit
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Feedback overlay */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center",
                showFeedback === "correct" ? "bg-green-500" : "bg-red-500"
              )}>
                {showFeedback === "correct" ? (
                  <CheckCircle className="h-12 w-12 text-white" />
                ) : (
                  <XCircle className="h-12 w-12 text-white" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Challenge type indicator */}
      <div className="text-center text-sm text-muted-foreground">
        {content.challengeType === "speed-round" && "Answer as fast as you can!"}
        {content.challengeType === "survival" && "Don't run out of lives!"}
        {content.challengeType === "high-score" && "Get the highest score possible!"}
        {content.challengeType === "accuracy" && "Be careful - mistakes cost you!"}
      </div>
    </div>
  );
}
