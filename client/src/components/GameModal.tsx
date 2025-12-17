import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { GamePlayer } from "./game-players/GamePlayer";
import { trpc } from "@/lib/trpc";
import type { GameContent } from "@shared/game-content";

interface GameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const [gameContent, setGameContent] = useState<GameContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: games } = trpc.games.list.useQuery();
  const incrementPlaysMutation = trpc.games.incrementPlays.useMutation();

  useEffect(() => {
    if (game && isOpen) {
      // Find the full game data with content from the database
      const fullGame = games?.find(g => g.id === game.id);
      
      if (fullGame && fullGame.gameContent) {
        try {
          const content = JSON.parse(fullGame.gameContent);
          setGameContent(content);
          setIsLoading(false);
          setError(null);
          
          // Increment play count
          incrementPlaysMutation.mutate({ gameId: game.id });
        } catch (err) {
          setError("Failed to load game content");
          setIsLoading(false);
        }
      } else {
        setError("This game doesn't have playable content yet");
        setIsLoading(false);
      }
    }
  }, [game, isOpen, games]);

  const handleComplete = (result?: any) => {
    console.log("Game completed with result:", result);
    // Could save progress, update stats, etc.
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
          ) : gameContent ? (
            <GamePlayer
              format={game.format}
              content={gameContent}
              onComplete={handleComplete}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
