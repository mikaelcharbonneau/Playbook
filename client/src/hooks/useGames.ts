import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { FilterState, Game } from "@/types";
import type { GameWithBookmark } from "@shared/types";

export function useGames() {
  const { data: rawGames = [], isLoading, refetch } = trpc.games.list.useQuery();
  
  // Transform backend data to frontend Game type
  const games: Game[] = useMemo(() => {
    return rawGames.map(game => ({
      ...game,
      tags: game.tags,
      createdBy: {
        id: game.createdById,
        username: "User", // We don't have user data yet
        avatarUrl: "/images/avatar-placeholder.jpg",
      },
    }));
  }, [rawGames]);
  const createGameMutation = trpc.games.create.useMutation();
  const toggleBookmarkMutation = trpc.bookmarks.toggle.useMutation();
  const incrementPlaysMutation = trpc.games.incrementPlays.useMutation();

  const addGame = async (game: Omit<Game, "id" | "createdAt" | "updatedAt" | "isBookmarked" | "likesCount" | "playsCount" | "createdBy">) => {
    await createGameMutation.mutateAsync({
      title: game.title,
      description: game.description,
      topic: game.topic,
      tags: game.tags,
      difficulty: game.difficulty,
      complexity: game.complexity,
      format: game.format,
      durationMinutes: game.durationMinutes,
      language: game.language,
      thumbnailUrl: game.thumbnailUrl ?? undefined,
    });
    await refetch();
  };

  const toggleBookmark = async (gameId: number) => {
    await toggleBookmarkMutation.mutateAsync({ gameId });
    await refetch();
  };

  const incrementPlays = async (gameId: number) => {
    await incrementPlaysMutation.mutateAsync({ gameId });
  };

  const filterGames = (filters: FilterState): Game[] => {
    let result = games;

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.topic.toLowerCase().includes(query)
      );
    }

    if (filters.topic) {
      result = result.filter((game) => game.topic === filters.topic);
    }

    if (filters.difficulty) {
      result = result.filter((game) => game.difficulty === filters.difficulty);
    }

    if (filters.complexity) {
      result = result.filter((game) => game.complexity === filters.complexity);
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

    return result;
  };

  return {
    games,
    isLoading,
    addGame,
    toggleBookmark,
    incrementPlays,
    filterGames,
    refetch,
  };
}
