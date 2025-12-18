/**
 * Universal Game Engine
 * 
 * This is the main component that interprets GameSpec and renders playable games.
 * It manages game state, handles progression, and delegates rendering to specialized
 * section renderers.
 */

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GameSpec, 
  GameState, 
  GameSection,
  AnswerRecord,
  ScoreRating 
} from "../../../../shared/game-schema";
import { QuizRenderer } from "./renderers/QuizRenderer";
import { FlashcardRenderer } from "./renderers/FlashcardRenderer";
import { MatchingRenderer } from "./renderers/MatchingRenderer";
import { SortingRenderer } from "./renderers/SortingRenderer";
import { NarrativeRenderer } from "./renderers/NarrativeRenderer";
import { SimulationRenderer } from "./renderers/SimulationRenderer";
import { ChallengeRenderer } from "./renderers/ChallengeRenderer";
import { InfoRenderer } from "./renderers/InfoRenderer";
import { GameIntro } from "./GameIntro";
import { GameOutro } from "./GameOutro";
import { GameHeader } from "./GameHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  RotateCcw, 
  X,
  Trophy,
  Clock,
  Heart,
  Lightbulb
} from "lucide-react";

interface GameEngineProps {
  spec: GameSpec;
  onComplete?: (state: GameState) => void;
  onExit?: () => void;
}

export function GameEngine({ spec, onComplete, onExit }: GameEngineProps) {
  // Game phases
  const [phase, setPhase] = useState<"intro" | "playing" | "outro">("intro");
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(spec));
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    spec.config?.timeLimit > 0 ? spec.config.timeLimit : null
  );

  // Initialize game state
  function createInitialState(spec: GameSpec): GameState {
    const firstSectionId = spec.progression?.sectionOrder?.[0] 
      || spec.progression?.startSection 
      || spec.content?.sections?.[0]?.id 
      || "";
    
    return {
      currentSectionId: firstSectionId,
      currentItemIndex: 0,
      score: 0,
      lives: spec.config?.lives || Infinity,
      hints: spec.config?.maxHints || 0,
      timeElapsed: 0,
      answers: [],
      completedSections: [],
      variables: {},
      inventory: [],
      streak: 0,
      isComplete: false,
    };
  }

  // Timer effect
  useEffect(() => {
    if (phase !== "playing" || timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      handleGameEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev !== null ? prev - 1 : null);
      setGameState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeRemaining]);

  // Get current section
  const currentSection = spec.content?.sections?.find(
    s => s.id === gameState.currentSectionId
  );

  // Calculate progress
  const totalSections = spec.content?.sections?.length || 0;
  const completedCount = gameState.completedSections.length;
  const progressPercent = totalSections > 0 
    ? (completedCount / totalSections) * 100 
    : 0;

  // Handle answer submission
  const handleAnswer = useCallback((
    sectionId: string,
    itemId: string,
    answer: unknown,
    isCorrect: boolean,
    pointsEarned: number,
    timeSpent: number
  ) => {
    setGameState(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const streakBonus = (spec.scoring?.streakMultiplier || 1) > 1 && newStreak >= 3
        ? Math.floor(pointsEarned * ((spec.scoring?.streakMultiplier || 1) - 1))
        : 0;
      
      const newLives = isCorrect ? prev.lives : prev.lives - 1;
      
      const answerRecord: AnswerRecord = {
        sectionId,
        itemId,
        answer,
        isCorrect,
        timeSpent,
        pointsEarned: pointsEarned + streakBonus,
      };

      return {
        ...prev,
        score: prev.score + pointsEarned + streakBonus,
        streak: newStreak,
        lives: newLives,
        answers: [...prev.answers, answerRecord],
      };
    });

    // Check for game over (no lives)
    if (!isCorrect && gameState.lives <= 1 && (spec.config?.lives || 0) > 0) {
      setTimeout(() => handleGameEnd(), 1000);
    }
  }, [gameState.lives, spec.config?.lives, spec.scoring?.streakMultiplier]);

  // Handle section completion
  const handleSectionComplete = useCallback((sectionId: string) => {
    setGameState(prev => {
      const newCompletedSections = [...prev.completedSections, sectionId];
      
      // Find next section
      const sectionOrder = spec.progression?.sectionOrder || spec.content?.sections?.map(s => s.id) || [];
      const currentIndex = sectionOrder.indexOf(sectionId);
      const nextSectionId = sectionOrder[currentIndex + 1];

      if (!nextSectionId) {
        // Game complete
        return {
          ...prev,
          completedSections: newCompletedSections,
          isComplete: true,
        };
      }

      return {
        ...prev,
        completedSections: newCompletedSections,
        currentSectionId: nextSectionId,
        currentItemIndex: 0,
      };
    });
  }, [spec.progression?.sectionOrder, spec.content?.sections]);

  // Handle game end
  const handleGameEnd = useCallback(() => {
    const finalRating = calculateRating(gameState.score, spec.scoring);
    setGameState(prev => ({
      ...prev,
      isComplete: true,
      finalRating,
    }));
    setPhase("outro");
  }, [gameState.score, spec.scoring]);

  // Check if game is complete
  useEffect(() => {
    if (gameState.isComplete && phase === "playing") {
      const finalRating = calculateRating(gameState.score, spec.scoring);
      setGameState(prev => ({ ...prev, finalRating }));
      setPhase("outro");
      onComplete?.(gameState);
    }
  }, [gameState.isComplete, phase, gameState.score, spec.scoring, onComplete]);

  // Use hint
  const handleUseHint = useCallback(() => {
    if (gameState.hints > 0) {
      setGameState(prev => ({ ...prev, hints: prev.hints - 1 }));
      return true;
    }
    return false;
  }, [gameState.hints]);

  // Restart game
  const handleRestart = useCallback(() => {
    setGameState(createInitialState(spec));
    setTimeRemaining(spec.config?.timeLimit > 0 ? spec.config.timeLimit : null);
    setPhase("intro");
  }, [spec]);

  // Start game
  const handleStart = useCallback(() => {
    setPhase("playing");
  }, []);

  // Navigate to specific section (for branching games)
  const handleNavigateToSection = useCallback((sectionId: string) => {
    setGameState(prev => ({
      ...prev,
      currentSectionId: sectionId,
      currentItemIndex: 0,
    }));
  }, []);

  // Update variables (for narrative/simulation games)
  const handleUpdateVariables = useCallback((updates: Record<string, unknown>) => {
    setGameState(prev => ({
      ...prev,
      variables: { ...prev.variables, ...updates },
    }));
  }, []);

  // Render section based on type
  const renderSection = (section: GameSection) => {
    const commonProps = {
      section,
      gameState,
      config: spec.config,
      scoring: spec.scoring,
      onAnswer: handleAnswer,
      onComplete: () => handleSectionComplete(section.id),
      onUseHint: handleUseHint,
      onNavigate: handleNavigateToSection,
      onUpdateVariables: handleUpdateVariables,
    };

    switch (section.type) {
      case "quiz":
        return <QuizRenderer {...commonProps} />;
      case "flashcards":
        return <FlashcardRenderer {...commonProps} />;
      case "matching":
        return <MatchingRenderer {...commonProps} />;
      case "sorting":
        return <SortingRenderer {...commonProps} />;
      case "narrative":
        return <NarrativeRenderer {...commonProps} />;
      case "simulation":
        return <SimulationRenderer {...commonProps} />;
      case "challenge":
        return <ChallengeRenderer {...commonProps} />;
      case "info":
        return <InfoRenderer {...commonProps} />;
      default:
        return (
          <div className="text-center p-8">
            <p className="text-muted-foreground">
              Unknown section type: {section.type}
            </p>
          </div>
        );
    }
  };

  // Safe access to theme background
  const backgroundStyle = spec.theme?.background?.type === "gradient" 
    ? spec.theme.background.value 
    : spec.theme?.background?.type === "solid"
    ? spec.theme.background.value
    : undefined;

  return (
    <div 
      className="h-full flex flex-col"
      style={{ background: backgroundStyle }}
    >
      {/* Header with stats */}
      {phase === "playing" && (
        <GameHeader
          title={spec.metadata?.title || 'Game'}
          score={gameState.score}
          lives={(spec.config?.lives || 0) > 0 ? gameState.lives : undefined}
          hints={spec.config?.hintsEnabled ? gameState.hints : undefined}
          timeRemaining={timeRemaining}
          streak={gameState.streak}
          onExit={onExit}
          primaryColor={spec.theme?.primaryColor || '#B6EBE7'}
        />
      )}

      {/* Progress bar */}
      {phase === "playing" && spec.progression?.showProgress && (
        <div className="px-4 pb-2">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {completedCount} / {totalSections} sections
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <GameIntro
                metadata={spec.metadata || { title: 'Game', description: '', subject: '', topic: '', difficulty: 'beginner', complexity: 'basic', estimatedMinutes: 10, learningObjectives: [], tags: [], language: 'English' }}
                intro={spec.content?.intro}
                theme={spec.theme || { primaryColor: '#B6EBE7', secondaryColor: '#7DD3C8', background: { type: 'solid', value: '#f5f5f5' }, icon: '🎮', mood: 'playful' }}
                config={spec.config}
                onStart={handleStart}
                onExit={onExit}
              />
            </motion.div>
          )}

          {phase === "playing" && currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-full"
            >
              {renderSection(currentSection)}
            </motion.div>
          )}

          {phase === "outro" && (
            <motion.div
              key="outro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full"
            >
              <GameOutro
                metadata={spec.metadata || { title: 'Game', description: '', subject: '', topic: '', difficulty: 'beginner', complexity: 'basic', estimatedMinutes: 10, learningObjectives: [], tags: [], language: 'English' }}
                outro={spec.content?.outro}
                gameState={gameState}
                scoring={spec.scoring}
                theme={spec.theme}
                onRestart={handleRestart}
                onExit={onExit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper function to calculate rating
function calculateRating(score: number, scoring: GameSpec["scoring"]): ScoreRating {
  const percentage = (score / scoring.maxScore) * 100;
  
  // Sort ratings by minPercentage descending to find the highest matching
  const sortedRatings = [...scoring.ratings].sort(
    (a, b) => b.minPercentage - a.minPercentage
  );
  
  for (const rating of sortedRatings) {
    if (percentage >= rating.minPercentage) {
      return rating;
    }
  }
  
  // Default rating if none match
  return {
    minPercentage: 0,
    label: "Keep Trying",
    message: "Practice makes perfect!",
    stars: 0,
  };
}

export default GameEngine;
