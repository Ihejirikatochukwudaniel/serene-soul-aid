import { MessageCircle, SmilePlus, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-lg">
        <div className="glass border-t backdrop-blur-xl">
          <div className="flex items-center justify-around px-6 py-4">
            <Link
              to="/"
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs font-medium">Chat</span>
            </Link>
            
            <Link
              to="/mood"
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive("/mood") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SmilePlus className="h-6 w-6" />
              <span className="text-xs font-medium">Mood</span>
            </Link>
            
            <Link
              to="/resources"
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive("/resources") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-xs font-medium">Resources</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
