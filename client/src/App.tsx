import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Feed from "./pages/Feed";
import Create from "./pages/Create";
import Browse from "./pages/Browse";
import { BottomNav } from "./components/BottomNav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Feed} />
      <Route path="/create" component={Create} />
      <Route path="/browse" component={Browse} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20">
            <Router />
            <BottomNav />
            <Toaster position="top-center" />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
