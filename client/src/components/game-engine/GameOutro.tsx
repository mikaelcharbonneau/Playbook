import { Button } from "@/components/ui/button";
import { 
  GameMetadata, 
  OutroScreen, 
  GameState, 
  GameTheme,
  ScoringConfig 
} from "../../../../shared/game-schema";
import { 
  Trophy, 
  Star, 
  RotateCcw, 
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Target
} from "lucide-react";
import { motion } from "framer-motion";

interface GameOutroProps {
  metadata: GameMetadata;
  outro?: OutroScreen;
  gameState: GameState;
  scoring: ScoringConfig;
  theme: GameTheme;
  onRestart: () => void;
  onExit?: () => void;
}

export function GameOutro({
  metadata,
  outro,
  gameState,
  scoring,
  theme,
  onRestart,
  onExit,
}: GameOutroProps) {
  const percentage = Math.round((gameState.score / scoring.maxScore) * 100);
  const correctAnswers = gameState.answers.filter(a => a.isCorrect).length;
  const totalAnswers = gameState.answers.length;
  const rating = gameState.finalRating;

  // Format completion message with variables
  const formatMessage = (template: string) => {
    return template
      .replace("{score}", gameState.score.toString())
      .replace("{total}", scoring.maxScore.toString())
      .replace("{percentage}", percentage.toString())
      .replace("{time}", formatTime(gameState.timeElapsed));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="h-full flex flex-col p-6 items-center justify-center">
      {/* Trophy animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="mb-6"
      >
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${theme.primaryColor}20` }}
        >
          <Trophy 
            className="h-12 w-12" 
            style={{ color: theme.primaryColor }}
          />
        </div>
      </motion.div>

      {/* Rating label */}
      {rating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl font-bold mb-2">{rating.label}</h1>
          
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Star
                  className={`h-8 w-8 ${
                    i < (rating.stars || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </motion.div>
            ))}
          </div>

          <p className="text-muted-foreground">{rating.message}</p>
        </motion.div>
      )}

      {/* Score display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 w-full max-w-sm"
      >
        {/* Main score */}
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-1">Final Score</p>
          <p className="text-4xl font-bold" style={{ color: theme.primaryColor }}>
            {gameState.score}
            <span className="text-lg text-muted-foreground">
              /{scoring.maxScore}
            </span>
          </p>
          <p className="text-lg font-medium">{percentage}%</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Correct answers */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="font-semibold">{correctAnswers}/{totalAnswers}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-semibold">{formatTime(gameState.timeElapsed)}</p>
            </div>
          </div>

          {/* Best streak */}
          {gameState.streak > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best Streak</p>
                <p className="font-semibold">{gameState.streak}x</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Learning summary */}
      {outro?.learningSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 w-full max-w-sm"
        >
          <h3 className="font-semibold mb-2">What You Learned</h3>
          <p className="text-sm text-muted-foreground">{outro.learningSummary}</p>
        </motion.div>
      )}

      {/* Next steps */}
      {outro?.nextSteps && outro.nextSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 w-full max-w-sm"
        >
          <h3 className="font-semibold mb-2">Next Steps</h3>
          <ul className="space-y-1">
            {outro.nextSteps.map((step, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span style={{ color: theme.primaryColor }}>→</span>
                {step}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex gap-3 w-full max-w-sm"
      >
        <Button
          variant="outline"
          onClick={onRestart}
          className="flex-1 h-12 rounded-xl"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Play Again
        </Button>
        
        {onExit && (
          <Button
            onClick={onExit}
            className="flex-1 h-12 rounded-xl"
            style={{ 
              backgroundColor: theme.primaryColor,
              color: "white" 
            }}
          >
            <Home className="h-5 w-5 mr-2" />
            Done
          </Button>
        )}
      </motion.div>
    </div>
  );
}
