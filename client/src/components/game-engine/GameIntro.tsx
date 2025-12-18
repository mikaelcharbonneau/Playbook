import { Button } from "@/components/ui/button";
import { 
  GameMetadata, 
  IntroScreen, 
  GameTheme, 
  GameConfig 
} from "../../../../shared/game-schema";
import { 
  Play, 
  Clock, 
  Target, 
  Heart, 
  Lightbulb,
  X,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

interface GameIntroProps {
  metadata: GameMetadata;
  intro?: IntroScreen;
  theme: GameTheme;
  config: GameConfig;
  onStart: () => void;
  onExit?: () => void;
}

export function GameIntro({
  metadata,
  intro,
  theme,
  config,
  onStart,
  onExit,
}: GameIntroProps) {
  return (
    <div className="h-full flex flex-col p-6">
      {/* Exit button */}
      {onExit && (
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="text-6xl text-center mb-6"
      >
        {theme.icon || "🎮"}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-center mb-2"
      >
        {intro?.title || metadata.title}
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center mb-6"
      >
        {intro?.description || metadata.description}
      </motion.p>

      {/* Tags */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-2 mb-6"
      >
        <span 
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: `${theme.primaryColor}20`,
            color: theme.primaryColor 
          }}
        >
          {metadata.subject}
        </span>
        <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
          {metadata.difficulty}
        </span>
        <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
          {metadata.complexity}
        </span>
      </motion.div>

      {/* Game info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 space-y-3"
      >
        {/* Duration */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">~{metadata.estimatedMinutes} minutes</p>
          </div>
        </div>

        {/* Lives */}
        {config.lives > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lives</p>
              <p className="font-medium">{config.lives} chances</p>
            </div>
          </div>
        )}

        {/* Hints */}
        {config.hintsEnabled && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hints Available</p>
              <p className="font-medium">{config.maxHints} hints</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Learning objectives */}
      {metadata.learningObjectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">What You'll Learn</h3>
          </div>
          <ul className="space-y-2">
            {metadata.learningObjectives.map((objective, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Target className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Instructions */}
      {intro?.instructions && intro.instructions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6"
        >
          <h3 className="font-semibold mb-3">How to Play</h3>
          <ol className="space-y-2">
            {intro.instructions.map((instruction, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ 
                    backgroundColor: theme.primaryColor,
                    color: "white" 
                  }}
                >
                  {i + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Start button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={onStart}
          className="w-full h-14 text-lg font-semibold rounded-2xl"
          style={{ 
            backgroundColor: theme.primaryColor,
            color: "white" 
          }}
        >
          <Play className="h-6 w-6 mr-2" />
          Start Game
        </Button>
      </motion.div>
    </div>
  );
}
