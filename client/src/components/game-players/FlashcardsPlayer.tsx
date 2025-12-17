import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RotateCw, ChevronLeft, ChevronRight, Lightbulb, Trophy } from "lucide-react";
import type { FlashcardsContent } from "@shared/game-content";
import { cn } from "@/lib/utils";

interface FlashcardsPlayerProps {
  content: FlashcardsContent;
  onComplete: () => void;
}

export function FlashcardsPlayer({ content, onComplete }: FlashcardsPlayerProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  const card = content.cards[currentCard];
  const progress = (masteredCards.size / content.cards.length) * 100;
  const isComplete = masteredCards.size === content.cards.length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowHint(false);
  };

  const handleNext = () => {
    if (currentCard < content.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleMastered = () => {
    const newMastered = new Set(masteredCards);
    newMastered.add(currentCard);
    setMasteredCards(newMastered);
    if (masteredCards.size + 1 === content.cards.length) {
      setTimeout(() => onComplete(), 500);
    } else {
      handleNext();
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-mint-100 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-mint-600" />
        </div>
        <div>
          <h2 className="text-3xl font-black mb-2">All Cards Mastered!</h2>
          <p className="text-xl text-muted-foreground">
            You've reviewed all <span className="font-bold text-mint-600">{content.cards.length}</span> flashcards
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Card {currentCard + 1} of {content.cards.length}</span>
          <span>Mastered: {masteredCards.size}/{content.cards.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center perspective-1000">
        <div
          className={cn(
            "relative w-full max-w-2xl aspect-[3/2] cursor-pointer transition-transform duration-500 preserve-3d",
            isFlipped && "rotate-y-180"
          )}
          onClick={handleFlip}
        >
          {/* Front */}
          <Card
            className={cn(
              "absolute inset-0 backface-hidden p-8 flex flex-col items-center justify-center",
              "bg-gradient-to-br from-mint-100 to-cream-100 border-2 border-mint-300",
              "shadow-soft"
            )}
          >
            <div className="text-center space-y-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">
                Front
              </div>
              <p className="text-2xl font-bold">{card.front}</p>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <RotateCw size={16} />
                <span>Tap to flip</span>
              </div>
            </div>
          </Card>

          {/* Back */}
          <Card
            className={cn(
              "absolute inset-0 backface-hidden rotate-y-180 p-8 flex flex-col items-center justify-center",
              "bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300",
              "shadow-soft"
            )}
          >
            <div className="text-center space-y-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">
                Back
              </div>
              <p className="text-2xl font-bold">{card.back}</p>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <RotateCw size={16} />
                <span>Tap to flip</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Hint */}
      {card.hint && (
        <div className="min-h-[60px]">
          {showHint ? (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-900">
                <strong>Hint:</strong> {card.hint}
              </p>
            </Card>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHint(true)}
              className="w-full rounded-full"
            >
              <Lightbulb size={16} className="mr-2" />
              Show Hint
            </Button>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentCard === 0}
          className="rounded-full px-6"
        >
          <ChevronLeft size={20} />
        </Button>
        
        <Button
          onClick={handleMastered}
          disabled={!isFlipped}
          className="flex-1 rounded-full h-12 text-lg font-bold"
        >
          {masteredCards.has(currentCard) ? "Already Mastered" : "I Know This!"}
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentCard === content.cards.length - 1}
          className="rounded-full px-6"
        >
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}
