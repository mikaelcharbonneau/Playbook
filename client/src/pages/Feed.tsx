import { useGames } from "@/hooks/useGames";
import { GameCard } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { useState } from "react";
import { Game } from "@/types";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Feed() {
  const { games, toggleBookmark } = useGames();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  return (
    <div className="h-screen w-full bg-background overflow-hidden relative">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-center bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
        <h1 className="text-2xl font-black text-white drop-shadow-md tracking-tight pointer-events-auto">
          LearnTok
        </h1>
        <Button 
          size="sm" 
          variant="secondary" 
          className="rounded-full bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/30 pointer-events-auto"
        >
          <Search size={16} className="mr-2" /> For You
        </Button>
      </div>

      {/* Vertical Snap Feed */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {games.map((game) => (
          <div key={game.id} className="h-full w-full snap-start p-2 pb-24 pt-0">
            <div className="h-full w-full rounded-3xl overflow-hidden shadow-2xl">
              <GameCard
                game={game}
                layoutType="feed"
                onPlay={setSelectedGame}
                onBookmark={toggleBookmark}
              />
            </div>
          </div>
        ))}
      </div>

      <GameModal
        game={selectedGame}
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </div>
  );
}
