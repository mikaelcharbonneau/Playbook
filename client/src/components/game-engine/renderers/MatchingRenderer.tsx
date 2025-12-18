import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  GameSection, 
  GameState, 
  GameConfig, 
  ScoringConfig,
  MatchingSectionContent,
  MatchPair 
} from "../../../../../shared/game-schema";
import { CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchingRendererProps {
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

export function MatchingRenderer({
  section,
  gameState,
  config,
  scoring,
  onAnswer,
  onComplete,
}: MatchingRendererProps) {
  const content = section.content as MatchingSectionContent;
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    content.timeLimit || null
  );

  // Shuffle items
  const [shuffledLeft] = useState(() => 
    [...content.pairs].sort(() => Math.random() - 0.5)
  );
  const [shuffledRight] = useState(() => 
    [...content.pairs].sort(() => Math.random() - 0.5)
  );

  // Timer
  useEffect(() => {
    if (timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      handleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Check for match when both items selected
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const leftPair = content.pairs.find(p => p.id === selectedLeft);
      const rightPair = content.pairs.find(p => p.id === selectedRight);
      
      if (leftPair && rightPair && leftPair.id === rightPair.id) {
        // Correct match
        setMatchedPairs(prev => new Set(Array.from(prev).concat(selectedLeft)));
        
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        onAnswer(
          section.id,
          selectedLeft,
          { left: selectedLeft, right: selectedRight },
          true,
          scoring.pointsPerCorrect,
          timeSpent
        );

        // Check if all matched
        if (matchedPairs.size + 1 >= content.pairs.length) {
          setTimeout(() => handleComplete(), 500);
        }
      } else {
        // Wrong match
        setWrongPair({ left: selectedLeft, right: selectedRight });
        
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        onAnswer(
          section.id,
          selectedLeft,
          { left: selectedLeft, right: selectedRight },
          false,
          0,
          timeSpent
        );

        setTimeout(() => {
          setWrongPair(null);
        }, 500);
      }

      // Reset selection
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 300);
    }
  }, [selectedLeft, selectedRight]);

  const handleComplete = () => {
    onComplete();
  };

  const handleLeftSelect = (id: string) => {
    if (matchedPairs.has(id)) return;
    setSelectedLeft(id);
  };

  const handleRightSelect = (id: string) => {
    if (matchedPairs.has(id)) return;
    setSelectedRight(id);
  };

  const isLeftMatched = (id: string) => matchedPairs.has(id);
  const isRightMatched = (id: string) => matchedPairs.has(id);

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Matched: {matchedPairs.size} / {content.pairs.length}
        </span>
        {timeRemaining !== null && (
          <div className={cn(
            "flex items-center gap-1 text-sm",
            timeRemaining <= 10 && "text-red-500"
          )}>
            <Clock className="h-4 w-4" />
            {timeRemaining}s
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Tap items on each side to match them
      </p>

      {/* Matching area */}
      <div className="flex-1 flex gap-4">
        {/* Left column */}
        <div className="flex-1 space-y-2">
          {shuffledLeft.map((pair) => (
            <motion.button
              key={`left-${pair.id}`}
              onClick={() => handleLeftSelect(pair.id)}
              disabled={isLeftMatched(pair.id)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full p-3 rounded-xl text-left transition-all",
                "border-2",
                isLeftMatched(pair.id) && "bg-green-50 border-green-300 opacity-50",
                !isLeftMatched(pair.id) && selectedLeft === pair.id && "bg-primary/10 border-primary",
                !isLeftMatched(pair.id) && selectedLeft !== pair.id && "bg-white border-gray-200",
                wrongPair?.left === pair.id && "bg-red-50 border-red-300 animate-shake"
              )}
            >
              <div className="flex items-center gap-2">
                {pair.left.image && (
                  <img 
                    src={pair.left.image} 
                    alt="" 
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <span className="text-sm font-medium">{pair.left.text}</span>
                {isLeftMatched(pair.id) && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right column */}
        <div className="flex-1 space-y-2">
          {shuffledRight.map((pair) => (
            <motion.button
              key={`right-${pair.id}`}
              onClick={() => handleRightSelect(pair.id)}
              disabled={isRightMatched(pair.id)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full p-3 rounded-xl text-left transition-all",
                "border-2",
                isRightMatched(pair.id) && "bg-green-50 border-green-300 opacity-50",
                !isRightMatched(pair.id) && selectedRight === pair.id && "bg-primary/10 border-primary",
                !isRightMatched(pair.id) && selectedRight !== pair.id && "bg-white border-gray-200",
                wrongPair?.right === pair.id && "bg-red-50 border-red-300 animate-shake"
              )}
            >
              <div className="flex items-center gap-2">
                {pair.right.image && (
                  <img 
                    src={pair.right.image} 
                    alt="" 
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <span className="text-sm font-medium">{pair.right.text}</span>
                {isRightMatched(pair.id) && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Complete button (shown when all matched) */}
      {matchedPairs.size >= content.pairs.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Button
            onClick={handleComplete}
            className="w-full h-12"
          >
            Continue
          </Button>
        </motion.div>
      )}
    </div>
  );
}
