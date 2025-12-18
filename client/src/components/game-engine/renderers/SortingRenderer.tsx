import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  GameSection, 
  GameState, 
  GameConfig, 
  ScoringConfig,
  SortingSectionContent,
  SortItem,
  SortCategory
} from "../../../../../shared/game-schema";
import { 
  CheckCircle, 
  XCircle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SortingRendererProps {
  section: GameSection;
  gameState: GameState;
  config: GameConfig;
  scoring: ScoringConfig;
  onAnswer: (
    sectionId: string,
    itemId: string,
    answer: unknown,
    isCorrect: boolean,
    pointsEarned: number,
    timeSpent: number
  ) => void;
  onComplete: () => void;
  onUseHint: () => boolean;
}

export function SortingRenderer({
  section,
  gameState,
  config,
  scoring,
  onAnswer,
  onComplete,
}: SortingRendererProps) {
  const content = section.content as SortingSectionContent;
  
  // Track which items are placed in which categories
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());

  // Items that haven't been placed yet
  const unplacedItems = content.items.filter(item => !placements[item.id]);

  const handleItemSelect = (itemId: string) => {
    if (showResult) return;
    setSelectedItem(itemId === selectedItem ? null : itemId);
  };

  const handleCategorySelect = (categoryId: string) => {
    if (showResult || !selectedItem) return;
    
    setPlacements(prev => ({
      ...prev,
      [selectedItem]: categoryId
    }));
    setSelectedItem(null);
  };

  const handleRemoveFromCategory = (itemId: string) => {
    if (showResult) return;
    setPlacements(prev => {
      const newPlacements = { ...prev };
      delete newPlacements[itemId];
      return newPlacements;
    });
  };

  const handleSubmit = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    // Check each placement
    let correctCount = 0;
    content.items.forEach(item => {
      const placedCategory = placements[item.id];
      if (placedCategory === item.correctCategory) {
        correctCount++;
      }
    });

    const allCorrect = correctCount === content.items.length;
    const pointsEarned = Math.floor(
      (correctCount / content.items.length) * scoring.pointsPerCorrect * content.items.length
    );

    setShowResult(true);

    onAnswer(
      section.id,
      section.id,
      placements,
      allCorrect,
      pointsEarned,
      timeSpent
    );
  };

  const handleContinue = () => {
    onComplete();
  };

  const allItemsPlaced = Object.keys(placements).length === content.items.length;

  return (
    <div className="h-full flex flex-col p-4">
      {/* Instructions */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">{content.instructions}</h2>
        <p className="text-sm text-muted-foreground">
          Tap an item, then tap a category to sort it
        </p>
      </div>

      {/* Unplaced items */}
      {unplacedItems.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Items to sort ({unplacedItems.length} remaining):
          </p>
          <div className="flex flex-wrap gap-2">
            {unplacedItems.map(item => (
              <motion.button
                key={item.id}
                onClick={() => handleItemSelect(item.id)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-3 py-2 rounded-xl border-2 transition-all",
                  selectedItem === item.id 
                    ? "bg-primary/10 border-primary" 
                    : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex-1 space-y-3 overflow-auto">
        {content.categories.map(category => {
          const itemsInCategory = content.items.filter(
            item => placements[item.id] === category.id
          );

          return (
            <motion.div
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all min-h-[80px]",
                selectedItem && !showResult
                  ? "border-primary/50 bg-primary/5 cursor-pointer hover:bg-primary/10"
                  : "border-gray-200 bg-white"
              )}
              style={{
                borderLeftColor: category.color || undefined,
                borderLeftWidth: category.color ? 4 : undefined
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{category.name}</h3>
                {category.description && (
                  <span className="text-xs text-muted-foreground">
                    {category.description}
                  </span>
                )}
              </div>

              {/* Items in this category */}
              <div className="flex flex-wrap gap-2">
                {itemsInCategory.map(item => {
                  const isCorrect = item.correctCategory === category.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "px-2 py-1 rounded-lg text-sm flex items-center gap-1",
                        !showResult && "bg-gray-100 cursor-pointer hover:bg-gray-200",
                        showResult && isCorrect && "bg-green-100 text-green-700",
                        showResult && !isCorrect && "bg-red-100 text-red-700"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!showResult) handleRemoveFromCategory(item.id);
                      }}
                    >
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-5 h-5 rounded object-cover"
                        />
                      )}
                      <span>{item.text}</span>
                      {showResult && (
                        isCorrect 
                          ? <CheckCircle className="h-3 w-3" />
                          : <XCircle className="h-3 w-3" />
                      )}
                    </motion.div>
                  );
                })}

                {itemsInCategory.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">
                    {selectedItem ? "Tap to place here" : "Empty"}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Result summary */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-white border"
        >
          <p className="font-semibold mb-2">Results:</p>
          <div className="space-y-1 text-sm">
            {content.items.map(item => {
              const placedCategory = placements[item.id];
              const isCorrect = placedCategory === item.correctCategory;
              const correctCategoryName = content.categories.find(
                c => c.id === item.correctCategory
              )?.name;

              return (
                <div 
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2",
                    isCorrect ? "text-green-600" : "text-red-600"
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span>{item.text}</span>
                  {!isCorrect && (
                    <span className="text-muted-foreground">
                      → {correctCategoryName}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="mt-4">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!allItemsPlaced}
            className="w-full h-12"
          >
            {allItemsPlaced ? "Check Answers" : `Place all items (${Object.keys(placements).length}/${content.items.length})`}
          </Button>
        ) : (
          <Button
            onClick={handleContinue}
            className="w-full h-12"
          >
            Continue
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
