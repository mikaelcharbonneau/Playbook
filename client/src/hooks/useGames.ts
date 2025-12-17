import { useState, useEffect } from "react";
import { Game, FilterState } from "@/types";
import { MOCK_GAMES } from "@/lib/mock-data";

export function useGames() {
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);
  const [filteredGames, setFilteredGames] = useState<Game[]>(MOCK_GAMES);

  const toggleLike = (gameId: string) => {
    setGames((prev) =>
      prev.map((game) =>
        game.id === gameId
          ? {
              ...game,
              likesCount: game.isBookmarked // Simulating like toggle logic for demo
                ? game.likesCount
                : game.likesCount + 1, // Simplified logic
            }
          : game
      )
    );
  };

  const toggleBookmark = (gameId: string) => {
    setGames((prev) =>
      prev.map((game) =>
        game.id === gameId ? { ...game, isBookmarked: !game.isBookmarked } : game
      )
    );
  };

  const addGame = (newGame: Game) => {
    setGames((prev) => [newGame, ...prev]);
  };

  const filterGames = (filters: FilterState) => {
    let result = [...games];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.topic.toLowerCase().includes(query) ||
          game.createdBy.username.toLowerCase().includes(query)
      );
    }

    if (filters.topic) {
      result = result.filter((game) => game.topic === filters.topic);
    }

    if (filters.difficulty) {
      result = result.filter((game) => game.difficulty === filters.difficulty);
    }

    if (filters.format) {
      result = result.filter((game) => game.format === filters.format);
    }

    if (filters.language) {
      result = result.filter((game) => game.language === filters.language);
    }

    if (filters.durationRange) {
      const [min, max] = filters.durationRange;
      result = result.filter(
        (game) => game.durationMinutes >= min && game.durationMinutes <= max
      );
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "trending":
          result.sort((a, b) => b.playsCount - a.playsCount); // Simplified trending
          break;
        case "most_played":
          result.sort((a, b) => b.playsCount - a.playsCount);
          break;
        case "newest":
          result.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }

    setFilteredGames(result);
  };

  // Re-run filter when games change
  useEffect(() => {
    // In a real app, we'd persist the current filter state and re-apply it
    // For now, we just update the filtered list to include any new games if no filter is active
    // or re-apply a basic sync.
    setFilteredGames(games); 
  }, [games]);

  return {
    games,
    filteredGames,
    toggleLike,
    toggleBookmark,
    addGame,
    filterGames,
  };
}
