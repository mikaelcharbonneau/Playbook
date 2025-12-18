import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  GameSection, 
  GameState, 
  GameConfig, 
  ScoringConfig,
  FlashcardSectionContent,
  Flashcard 
} from "../../../../../shared/game-schema";
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ArrowLeft,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardRendererProps {
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

export function FlashcardRenderer({
  section,
  gameState,
  config,
  scoring,
  onAnswer,
  onComplete,
  onUseHint,
}: FlashcardRendererProps) {
  const content = section.content as FlashcardSectionContent;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());
  const [textAnswer, setTextAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [cardStartTime, setCardStartTime] = useState(Date.now());

  const currentCard = content.cards[currentIndex];
  const totalCards = content.cards.length;
  const reviewedCount = knownCards.size + unknownCards.size;

  // Reset state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setTextAnswer("");
    setShowResult(false);
    setCardStartTime(Date.now());
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnow = () => {
    const timeSpent = Math.round((Date.now() - cardStartTime) / 1000);
    setKnownCards(prev => new Set(Array.from(prev).concat(currentCard.id)));
    
    onAnswer(
      section.id,
      currentCard.id,
      "known",
      true,
      scoring.pointsPerCorrect,
      timeSpent
    );

    goToNext();
  };

  const handleDontKnow = () => {
    const timeSpent = Math.round((Date.now() - cardStartTime) / 1000);
    setUnknownCards(prev => new Set(Array.from(prev).concat(currentCard.id)));
    
    onAnswer(
      section.id,
      currentCard.id,
      "unknown",
      false,
      0,
      timeSpent
    );

    goToNext();
  };

  const handleTextSubmit = () => {
    if (!textAnswer.trim()) return;
    
    const timeSpent = Math.round((Date.now() - cardStartTime) / 1000);
    const normalizedAnswer = textAnswer.toLowerCase().trim();
    const normalizedCorrect = currentCard.back.text.toLowerCase().trim();
    const correct = normalizedAnswer === normalizedCorrect;
    
    setIsCorrect(correct);
    setShowResult(true);
    setIsFlipped(true);
    
    if (correct) {
      setKnownCards(prev => new Set(Array.from(prev).concat(currentCard.id)));
    } else {
      setUnknownCards(prev => new Set(Array.from(prev).concat(currentCard.id)));
    }
    
    onAnswer(
      section.id,
      currentCard.id,
      textAnswer,
      correct,
      correct ? scoring.pointsPerCorrect : 0,
      timeSpent
    );
  };

  const goToNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (reviewedCount + 1 >= totalCards) {
      // All cards reviewed
      onComplete();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {totalCards}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-600">
            ✓ {knownCards.size}
          </span>
          <span className="text-sm text-red-600">
            ✗ {unknownCards.size}
          </span>
        </div>
      </div>

      {/* Category badge */}
      {currentCard.category && (
        <div className="mb-4">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
            {currentCard.category}
          </span>
        </div>
      )}

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center">
        <div 
          className="w-full max-w-sm perspective-1000"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="relative w-full aspect-[3/4] cursor-pointer"
            onClick={content.testMode === "flip-reveal" ? handleFlip : undefined}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front of card */}
            <div 
              className={cn(
                "absolute inset-0 backface-hidden",
                "bg-white rounded-2xl shadow-lg p-6",
                "flex flex-col items-center justify-center",
                "border-2 border-gray-100"
              )}
              style={{ backfaceVisibility: "hidden" }}
            >
              {currentCard.front.media && (
                <img 
                  src={currentCard.front.media.content}
                  alt=""
                  className="max-w-full max-h-32 mb-4 rounded-lg"
                />
              )}
              <p className="text-xl font-semibold text-center">
                {currentCard.front.text}
              </p>
              
              {content.testMode === "flip-reveal" && (
                <p className="text-sm text-muted-foreground mt-4">
                  Tap to flip
                </p>
              )}
            </div>

            {/* Back of card */}
            <div 
              className={cn(
                "absolute inset-0 backface-hidden",
                "bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl shadow-lg p-6",
                "flex flex-col items-center justify-center",
                "border-2 border-primary/20"
              )}
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              {currentCard.back.media && (
                <img 
                  src={currentCard.back.media.content}
                  alt=""
                  className="max-w-full max-h-32 mb-4 rounded-lg"
                />
              )}
              <p className="text-xl font-semibold text-center text-primary">
                {currentCard.back.text}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Type answer mode */}
      {content.testMode === "type-answer" && !isFlipped && (
        <div className="mt-4 space-y-3">
          <Input
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="h-12 text-lg"
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
          />
          <Button
            onClick={handleTextSubmit}
            disabled={!textAnswer.trim()}
            className="w-full h-12"
          >
            Check Answer
          </Button>
        </div>
      )}

      {/* Result feedback for type mode */}
      {showResult && content.testMode === "type-answer" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-4 p-4 rounded-xl",
            isCorrect ? "bg-green-50" : "bg-red-50"
          )}
        >
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-700">Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-semibold text-red-700">
                  The answer was: {currentCard.back.text}
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Action buttons for flip mode */}
      {content.testMode === "flip-reveal" && isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex gap-3"
        >
          <Button
            variant="outline"
            onClick={handleDontKnow}
            className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-5 w-5 mr-2" />
            Didn't Know
          </Button>
          <Button
            onClick={handleKnow}
            className="flex-1 h-12 bg-green-500 hover:bg-green-600"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Knew It
          </Button>
        </motion.div>
      )}

      {/* Next button for type mode after result */}
      {showResult && content.testMode === "type-answer" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Button
            onClick={goToNext}
            className="w-full h-12"
          >
            {currentIndex < totalCards - 1 ? "Next Card" : "Complete"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      )}

      {/* Navigation for flip mode when not flipped */}
      {content.testMode === "flip-reveal" && !isFlipped && (
        <div className="mt-4 flex justify-between">
          <Button
            variant="ghost"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsFlipped(true)}
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Flip Card
          </Button>
        </div>
      )}
    </div>
  );
}
