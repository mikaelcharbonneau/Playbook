import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { GameEngine } from "./game-engine/GameEngine";
import { trpc } from "@/lib/trpc";
import type { GameSpec } from "@shared/game-schema";

interface GameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const [gameSpec, setGameSpec] = useState<GameSpec | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: games } = trpc.games.list.useQuery();
  const incrementPlaysMutation = trpc.games.incrementPlays.useMutation();

  useEffect(() => {
    if (game && isOpen) {
      setIsLoading(true);
      setError(null);
      
      // Find the full game data with content from the database
      const fullGame = games?.find(g => g.id === game.id);
      
      if (fullGame && fullGame.gameContent) {
        try {
          const content = JSON.parse(fullGame.gameContent);
          
          // Check if it's a GameSpec (new format) or old format
          if (content.version && content.metadata && content.content) {
            // New GameSpec format
            setGameSpec(content as GameSpec);
          } else {
            // Old format - convert to GameSpec
            const convertedSpec = convertLegacyToGameSpec(content, fullGame);
            setGameSpec(convertedSpec);
          }
          
          setIsLoading(false);
          
          // Increment play count
          incrementPlaysMutation.mutate({ gameId: game.id });
        } catch (err) {
          console.error("Failed to parse game content:", err);
          setError("Failed to load game content");
          setIsLoading(false);
        }
      } else {
        setError("This game doesn't have playable content yet");
        setIsLoading(false);
      }
    }
  }, [game, isOpen, games]);

  const handleComplete = (state: any) => {
    console.log("Game completed:", state);
    // Could save progress, update stats, show achievements, etc.
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-background">
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-white to-transparent z-10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-foreground">{game.title}</h2>
              <p className="text-sm text-muted-foreground">{game.topic} • {game.difficulty} • {game.complexity}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
              <X size={24} />
            </Button>
          </div>
        </div>

        {/* Game Content Area */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-mint-200 border-t-mint-600 rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading game...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="text-6xl">⚠️</div>
                <p className="text-lg text-muted-foreground">{error}</p>
                <p className="text-sm text-muted-foreground">
                  This game might be from the seed data. Try creating a new game using the Create tab!
                </p>
              </div>
            </div>
          ) : gameSpec ? (
            <GameEngine
              spec={gameSpec}
              onComplete={handleComplete}
              onExit={onClose}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Convert legacy game content format to new GameSpec format
function convertLegacyToGameSpec(content: any, game: any): GameSpec {
  // Determine the game type from the content structure
  let gameType: "quiz" | "flashcard" | "matching" = "quiz";
  let sections: any[] = [];

  if (content.questions) {
    // Quiz format
    gameType = "quiz";
    sections = [{
      id: "main",
      title: "Quiz",
      type: "quiz",
      content: {
        type: "quiz",
        questions: content.questions.map((q: any, i: number) => ({
          id: `q${i + 1}`,
          question: q.question,
          questionType: "single-choice" as const,
          options: q.options.map((opt: string, j: number) => ({
            id: `opt${j}`,
            text: opt
          })),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: 10
        }))
      }
    }];
  } else if (content.cards && content.cards[0]?.front !== undefined) {
    // Flashcard format
    gameType = "flashcard";
    sections = [{
      id: "main",
      title: "Flashcards",
      type: "flashcards",
      content: {
        type: "flashcards",
        cards: content.cards.map((c: any, i: number) => ({
          id: `card${i + 1}`,
          front: { text: c.front },
          back: { text: c.back },
          hint: c.hint
        })),
        testMode: "flip-reveal" as const
      }
    }];
  } else if (content.cards && content.cards[0]?.matchId !== undefined) {
    // Memory/Matching format
    gameType = "matching";
    // Group cards by matchId to create pairs
    const pairMap = new Map<string, any[]>();
    content.cards.forEach((card: any) => {
      if (!pairMap.has(card.matchId)) {
        pairMap.set(card.matchId, []);
      }
      pairMap.get(card.matchId)!.push(card);
    });

    const pairs = Array.from(pairMap.entries()).map(([matchId, cards], i) => ({
      id: `pair${i + 1}`,
      left: { text: cards[0]?.content || "" },
      right: { text: cards[1]?.content || cards[0]?.content || "" }
    }));

    sections = [{
      id: "main",
      title: "Matching",
      type: "matching",
      content: {
        type: "matching",
        pairs,
        matchStyle: "tap-tap" as const
      }
    }];
  }

  return {
    version: "1.0",
    metadata: {
      title: game.title || "Game",
      description: game.description || "",
      subject: game.topic || "General",
      topic: game.topic || "General",
      difficulty: (game.difficulty?.toLowerCase() || "intermediate") as "beginner" | "intermediate" | "advanced",
      complexity: (game.complexity === "Normal" ? "standard" : game.complexity?.toLowerCase() || "basic") as "basic" | "standard" | "complex",
      estimatedMinutes: game.durationMinutes || 10,
      learningObjectives: [],
      tags: game.tags || [],
      language: game.language || "English"
    },
    theme: {
      primaryColor: "#B6EBE7",
      secondaryColor: "#7DD3C8",
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #B6EBE7 0%, #7DD3C8 100%)"
      },
      icon: "🎮",
      mood: "playful"
    },
    config: {
      gameType,
      timeLimit: 0,
      questionTimeLimit: 0,
      allowSkip: true,
      allowBack: true,
      hintsEnabled: true,
      maxHints: 3,
      lives: 0,
      shuffleContent: false,
      feedbackType: "immediate",
      showCorrectAnswer: true
    },
    content: {
      sections
    },
    progression: {
      type: "linear",
      sectionOrder: ["main"],
      showProgress: true
    },
    scoring: {
      maxScore: 100,
      pointsPerCorrect: 10,
      penaltyPerWrong: 0,
      timeBonus: false,
      streakMultiplier: 1,
      ratings: [
        { minPercentage: 90, label: "Excellent", message: "Outstanding!", stars: 3 },
        { minPercentage: 70, label: "Good", message: "Well done!", stars: 2 },
        { minPercentage: 50, label: "Fair", message: "Keep practicing!", stars: 1 },
        { minPercentage: 0, label: "Needs Work", message: "Try again!", stars: 0 }
      ]
    }
  };
}
