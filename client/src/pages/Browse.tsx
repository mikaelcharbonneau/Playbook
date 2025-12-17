import { useState, useEffect } from "react";
import { useGames } from "@/hooks/useGames";
import { GameCard } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Game, FilterState } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export default function Browse() {
  const { filteredGames, filterGames, toggleLike, toggleBookmark } = useGames();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange({ searchQuery });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...activeFilters, ...newFilters };
    setActiveFilters(updated);
    filterGames(updated);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery("");
    filterGames({});
  };

  const topics = ["Math", "Science", "Languages", "Geography", "Programming"];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header & Search */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border/50 p-4 shadow-sm">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games, topics, or creators..."
            className="pl-12 pr-10 h-12 rounded-full bg-muted/30 border-transparent focus:bg-white transition-all text-base"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shrink-0 h-9 w-9 border-dashed border-primary/50 text-primary bg-primary/5">
                <SlidersHorizontal size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl h-[80vh]">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 overflow-y-auto pb-20">
                <div className="space-y-3">
                  <Label>Sort By</Label>
                  <RadioGroup 
                    defaultValue={activeFilters.sortBy || "trending"}
                    onValueChange={(v: any) => handleFilterChange({ sortBy: v })}
                    className="flex gap-2"
                  >
                    {["Trending", "Newest", "Most Played"].map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.toLowerCase().replace(" ", "_")} id={opt} className="peer sr-only" />
                        <Label
                          htmlFor={opt}
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Difficulty</Label>
                  <div className="flex gap-2">
                    {["Beginner", "Intermediate", "Advanced"].map((diff) => (
                      <Badge
                        key={diff}
                        variant={activeFilters.difficulty === diff ? "default" : "outline"}
                        className="cursor-pointer px-4 py-2 rounded-full text-sm"
                        onClick={() => handleFilterChange({ 
                          difficulty: activeFilters.difficulty === diff ? undefined : diff as any 
                        })}
                      >
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Duration (Minutes)</Label>
                  <Slider 
                    defaultValue={[0, 60]} 
                    max={60} 
                    step={5} 
                    className="py-4"
                    onValueChange={(val) => handleFilterChange({ durationRange: [val[0], val[1]] })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0m</span>
                    <span>60m+</span>
                  </div>
                </div>
              </div>

              <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-border/50">
                <Button onClick={clearFilters} variant="outline" className="flex-1 rounded-full mr-2">Reset</Button>
                <Button onClick={() => document.querySelector('[data-state="open"]')?.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}))} className="flex-1 rounded-full">Apply</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {topics.map((topic) => (
            <Badge
              key={topic}
              variant={activeFilters.topic === topic ? "default" : "secondary"}
              className={cn(
                "cursor-pointer px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all",
                activeFilters.topic === topic 
                  ? "bg-primary text-primary-foreground shadow-glow" 
                  : "bg-muted/50 hover:bg-muted"
              )}
              onClick={() => handleFilterChange({ 
                topic: activeFilters.topic === topic ? undefined : topic 
              })}
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              layoutType="grid"
              onPlay={setSelectedGame}
              onLike={toggleLike}
              onBookmark={toggleBookmark}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No games found</h3>
            <p>Try adjusting your filters or search query.</p>
            <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">Clear all filters</Button>
          </div>
        )}
      </div>

      <GameModal
        game={selectedGame}
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </div>
  );
}
