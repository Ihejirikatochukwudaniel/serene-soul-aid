import { Brain, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe">
      <div className="mx-auto max-w-lg">
        <div className="glass border-b backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Brain className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold">MindAid</span>
            </div>
            
            <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
