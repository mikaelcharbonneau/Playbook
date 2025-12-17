import { Game } from "@/types";
import { Heart, Bookmark, Play, Share2, Clock, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GameCardProps {
  game: Game;
  layoutType?: "feed" | "grid";
  onPlay?: (game: Game) => void;
  onLike?: (gameId: string) => void;
  onBookmark?: (gameId: string) => void;
}

export function GameCard({
  game,
  layoutType = "feed",
  onPlay,
  onLike,
  onBookmark,
}: GameCardProps) {
  const isFeed = layoutType === "feed";

  if (isFeed) {
    return (
      <div className="relative w-full h-full flex flex-col justify-end p-6 snap-start shrink-0 overflow-hidden rounded-3xl bg-white shadow-soft border border-white/50">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 z-0">
          {game.thumbnailUrl ? (
            <img
              src={game.thumbnailUrl}
              alt={game.title}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-mint-100 to-cream-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col gap-4 text-white">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/20 hover:bg-white/30">
              {game.topic}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/20 hover:bg-white/30">
              {game.difficulty}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/20 hover:bg-white/30">
              {game.complexity}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/20 hover:bg-white/30">
              <Clock size={12} className="mr-1" /> {game.durationMinutes}m
            </Badge>
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-tight mb-2 drop-shadow-md">{game.title}</h2>
            <p className="text-white/90 line-clamp-2 text-sm font-medium drop-shadow-sm">
              {game.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1">
                <Play size={16} className="fill-white" /> {game.playsCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={16} className="fill-white" /> {game.likesCount}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              size="lg"
              className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-bold text-lg h-14"
              onClick={() => onPlay?.(game)}
            >
              Play Now
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 hover:text-white"
              onClick={() => onBookmark?.(game.id)}
            >
              <Bookmark
                size={24}
                className={cn(game.isBookmarked && "fill-current text-primary")}
              />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 hover:text-white"
            >
              <Share2 size={24} />
            </Button>
          </div>
        </div>

        {/* Side Actions (TikTok style) */}
        <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-6 items-center">
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30"
              onClick={() => onLike?.(game.id)}
            >
              <Heart
                size={28}
                className={cn("transition-all", game.likesCount > 1000 && "fill-red-500 text-red-500")} // Demo logic
              />
            </Button>
            <span className="text-xs font-bold text-white drop-shadow-md">{game.likesCount}</span>
          </div>
          
           <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-12 rounded-full bg-white p-0.5 overflow-hidden border-2 border-white shadow-sm">
               <img src={game.createdBy.avatarUrl} alt={game.createdBy.username} className="w-full h-full object-cover rounded-full" />
            </div>
             <span className="text-[10px] font-bold text-white drop-shadow-md max-w-[60px] truncate text-center">{game.createdBy.username}</span>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout (Browse Page)
  return (
    <div 
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-soft transition-all duration-300 border border-border/50 cursor-pointer"
      onClick={() => onPlay?.(game)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {game.thumbnailUrl ? (
          <img
            src={game.thumbnailUrl}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-mint-50 to-cream-100" />
        )}
        <div className="absolute top-2 right-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.(game.id);
            }}
          >
            <Bookmark
              size={14}
              className={cn(game.isBookmarked && "fill-primary text-primary")}
            />
          </Button>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
           <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[10px] h-5 px-2 shadow-sm">
              {game.topic}
            </Badge>
             <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[10px] h-5 px-2 shadow-sm">
              {game.difficulty}
            </Badge>
             <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[10px] h-5 px-2 shadow-sm">
              {game.complexity}
            </Badge>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-auto">
          {game.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Play size={12} /> {game.playsCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} /> {game.likesCount}
            </span>
          </div>
          <span className="flex items-center gap-1 font-medium text-foreground">
             <Clock size={12} /> {game.durationMinutes}m
          </span>
        </div>
      </div>
    </div>
  );
}
