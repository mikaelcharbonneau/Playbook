import { Link, useLocation } from "wouter";
import { Home, PlusCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Feed" },
    { path: "/create", icon: PlusCircle, label: "Create" },
    { path: "/browse", icon: Search, label: "Browse" },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="glass flex items-center justify-around w-full max-w-md px-2 py-2 rounded-full shadow-soft pointer-events-auto bg-white/80 backdrop-blur-xl border-white/40">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ease-out cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow transform -translate-y-2 scale-110"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn("transition-transform duration-300", isActive && "scale-110")}
                />
                {isActive && (
                  <span className="text-[10px] font-bold mt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
