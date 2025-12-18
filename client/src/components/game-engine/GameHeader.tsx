import { Button } from "@/components/ui/button";
import { X, Heart, Lightbulb, Trophy, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface GameHeaderProps {
  title: string;
  score: number;
  lives?: number;
  hints?: number;
  timeRemaining: number | null;
  streak: number;
  onExit?: () => void;
  primaryColor: string;
}

export function GameHeader({
  title,
  score,
  lives,
  hints,
  timeRemaining,
  streak,
  onExit,
  primaryColor,
}: GameHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b">
      {/* Left: Exit button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onExit}
        className="rounded-full"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Center: Title and stats */}
      <div className="flex items-center gap-4">
        {/* Score */}
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <motion.span
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-semibold"
          >
            {score}
          </motion.span>
        </div>

        {/* Streak */}
        {streak >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <Zap className="h-3 w-3" style={{ color: primaryColor }} />
            <span className="text-sm font-medium" style={{ color: primaryColor }}>
              {streak}x
            </span>
          </motion.div>
        )}

        {/* Timer */}
        {timeRemaining !== null && (
          <div className={`flex items-center gap-1 ${timeRemaining <= 10 ? "text-red-500" : ""}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Right: Lives and hints */}
      <div className="flex items-center gap-3">
        {/* Lives */}
        {lives !== undefined && lives !== Infinity && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 ${
                  i < lives ? "text-red-500 fill-red-500" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        )}

        {/* Hints */}
        {hints !== undefined && (
          <div className="flex items-center gap-1 text-amber-500">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm font-medium">{hints}</span>
          </div>
        )}
      </div>
    </div>
  );
}
