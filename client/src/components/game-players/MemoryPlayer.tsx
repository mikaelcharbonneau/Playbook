import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, RotateCcw } from "lucide-react";
import type { MemoryContent } from "@shared/game-content";
import { cn } from "@/lib/utils";

interface MemoryPlayerProps {
  content: MemoryContent;
  onComplete: (moves: number) => void;
}

export function MemoryPlayer({ content, onComplete }: MemoryPlayerProps) {
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const isComplete = matchedCards.size === content.cards.length;

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      const [first, second] = flippedCards;
      const firstCard = content.cards[first];
      const secondCard = content.cards[second];

      if (firstCard.matchId === secondCard.matchId) {
        // Match found
        setTimeout(() => {
          const newMatched = new Set(matchedCards);
          newMatched.add(firstCard.id);
          newMatched.add(secondCard.id);
          setMatchedCards(newMatched);
          setFlippedCards([]);
          setIsChecking(false);
        }, 800);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 1200);
      }
      setMoves(moves + 1);
    }
  }, [flippedCards]);

  useEffect(() => {
    if (isComplete && matchedCards.size > 0) {
      setTimeout(() => onComplete(moves), 1000);
    }
  }, [isComplete]);

  const handleCardClick = (index: number) => {
    if (
      isChecking ||
      flippedCards.includes(index) ||
      matchedCards.has(content.cards[index].id)
    ) {
      return;
    }

    setFlippedCards([...flippedCards, index]);
  };

  const handleReset = () => {
    setFlippedCards([]);
    setMatchedCards(new Set());
    setMoves(0);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-mint-100 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-mint-600" />
        </div>
        <div>
          <h2 className="text-3xl font-black mb-2">Perfect Match!</h2>
          <p className="text-xl text-muted-foreground">
            You completed the game in <span className="font-bold text-mint-600">{moves}</span> moves
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <span className="font-bold">Moves:</span> {moves}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-bold">Matched:</span> {matchedCards.size / 2} / {content.cards.length / 2}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="rounded-full"
        >
          <RotateCcw size={16} className="mr-2" />
          Reset
        </Button>
      </div>

      {/* Game Grid */}
      <div
        className="flex-1 grid gap-3 auto-rows-fr"
        style={{
          gridTemplateColumns: `repeat(${content.gridSize}, 1fr)`,
        }}
      >
        {content.cards.map((card, index) => {
          const isFlipped = flippedCards.includes(index);
          const isMatched = matchedCards.has(card.id);
          const shouldShow = isFlipped || isMatched;

          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={isChecking || isMatched}
              className={cn(
                "relative rounded-2xl transition-all duration-300 preserve-3d",
                "hover:scale-105 active:scale-95",
                shouldShow && "rotate-y-180",
                isMatched && "opacity-50"
              )}
            >
              {/* Card Back */}
              <Card
                className={cn(
                  "absolute inset-0 backface-hidden flex items-center justify-center",
                  "bg-gradient-to-br from-mint-200 to-cream-200 border-2 border-mint-400",
                  "shadow-soft"
                )}
              >
                <div className="text-4xl">?</div>
              </Card>

              {/* Card Front */}
              <Card
                className={cn(
                  "absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-2",
                  "bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300",
                  "shadow-soft"
                )}
              >
                <div className="text-center text-sm font-bold break-words">
                  {card.content}
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
