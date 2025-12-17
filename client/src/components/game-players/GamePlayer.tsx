import { QuizPlayer } from "./QuizPlayer";
import { FlashcardsPlayer } from "./FlashcardsPlayer";
import { MemoryPlayer } from "./MemoryPlayer";
import type { GameContent } from "@shared/game-content";
import type { GameFormat } from "@shared/types";
import {
  isQuizContent,
  isFlashcardsContent,
  isMemoryContent,
} from "@shared/game-content";

interface GamePlayerProps {
  format: GameFormat;
  content: GameContent;
  onComplete: (result?: any) => void;
}

export function GamePlayer({ format, content, onComplete }: GamePlayerProps) {
  // Route to the appropriate player based on format
  if (format === "Quiz" && isQuizContent(content)) {
    return <QuizPlayer content={content} onComplete={onComplete} />;
  }

  if (format === "Flashcards" && isFlashcardsContent(content)) {
    return <FlashcardsPlayer content={content} onComplete={onComplete} />;
  }

  if (format === "Memory" && isMemoryContent(content)) {
    return <MemoryPlayer content={content} onComplete={onComplete} />;
  }

  // Fallback for unsupported formats
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <div className="text-6xl">🎮</div>
      <h3 className="text-2xl font-bold">Coming Soon!</h3>
      <p className="text-muted-foreground">
        The {format} player is currently under development.
      </p>
    </div>
  );
}
