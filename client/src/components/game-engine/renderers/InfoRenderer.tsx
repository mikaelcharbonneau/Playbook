import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  GameSection, 
  GameState, 
  GameConfig, 
  ScoringConfig,
  InfoSectionContent,
  InfoBlock
} from "../../../../../shared/game-schema";
import { 
  ArrowRight,
  BookOpen,
  Image,
  List,
  Table,
  Quote,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoRendererProps {
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

export function InfoRenderer({
  section,
  onAnswer,
  onComplete,
}: InfoRendererProps) {
  const content = section.content as InfoSectionContent;
  const [startTime] = useState(Date.now());
  const [hasRead, setHasRead] = useState(false);

  const handleContinue = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    // Award points for reading
    onAnswer(
      section.id,
      section.id,
      "read",
      true,
      10, // Small points for reading
      timeSpent
    );
    
    onComplete();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrolledToBottom = 
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (scrolledToBottom) {
      setHasRead(true);
    }
  };

  const renderBlock = (block: InfoBlock, index: number) => {
    switch (block.type) {
      case "text":
        return (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-base leading-relaxed"
          >
            {block.content as string}
          </motion.p>
        );

      case "image":
        const imageContent = block.content as { src: string; caption?: string; alt?: string };
        return (
          <motion.figure
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="my-4"
          >
            <img
              src={imageContent.src}
              alt={imageContent.alt || ""}
              className="w-full rounded-xl"
            />
            {imageContent.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-2">
                {imageContent.caption}
              </figcaption>
            )}
          </motion.figure>
        );

      case "list":
        const listContent = block.content as { items: string[]; ordered?: boolean };
        const ListTag = listContent.ordered ? "ol" : "ul";
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ListTag className={cn(
              "space-y-2 pl-5",
              listContent.ordered ? "list-decimal" : "list-disc"
            )}>
              {listContent.items.map((item, i) => (
                <li key={i} className="text-base">{item}</li>
              ))}
            </ListTag>
          </motion.div>
        );

      case "table":
        const tableContent = block.content as { 
          headers: string[]; 
          rows: string[][] 
        };
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="overflow-x-auto my-4"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {tableContent.headers.map((header, i) => (
                    <th 
                      key={i} 
                      className="border border-gray-200 px-3 py-2 text-left font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableContent.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="even:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td 
                        key={cellIndex}
                        className="border border-gray-200 px-3 py-2"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        );

      case "quote":
        const quoteContent = block.content as { text: string; author?: string };
        return (
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-l-4 border-primary pl-4 py-2 my-4 italic bg-primary/5 rounded-r-lg"
          >
            <p className="text-base">"{quoteContent.text}"</p>
            {quoteContent.author && (
              <footer className="text-sm text-muted-foreground mt-2">
                — {quoteContent.author}
              </footer>
            )}
          </motion.blockquote>
        );

      case "code":
        const codeContent = block.content as { code: string; language?: string };
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="my-4"
          >
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              {codeContent.language && (
                <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400">
                  {codeContent.language}
                </div>
              )}
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-gray-100 font-mono">
                  {codeContent.code}
                </code>
              </pre>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Learning Material</span>
        </div>
        <h2 className="text-xl font-bold">{content.title}</h2>
      </div>

      {/* Content */}
      <div 
        className="flex-1 overflow-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {content.content.map((block, index) => renderBlock(block, index))}
        
        {/* Spacer to ensure scroll detection works */}
        <div className="h-4" />
      </div>

      {/* Continue button */}
      <div className="p-4 border-t bg-white">
        <Button
          onClick={handleContinue}
          className="w-full h-12"
        >
          {hasRead ? "Continue" : "I've read this"}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
