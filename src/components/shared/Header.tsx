import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Zap, Sun, Moon, Code, Github } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // After mounting, we can show the theme toggle (avoids hydration issues)
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  
  const handleToggleTheme = () => {
    setTheme(nextTheme);
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">
            <span className="gradient-text">API</span> Testing Hub
          </h1>
        </div>
        <div className="hidden md:flex items-center h-6 ml-3 pl-3 border-l border-border/80 text-muted-foreground">
          <span className="text-sm">v1.0</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <a 
          href="https://github.com/user/api-testing-hub" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-5 w-5" />
        </a>
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex items-center gap-1.5 h-8 text-xs text-muted-foreground"
        >
          <Code className="h-3.5 w-3.5" />
          Documentation
        </Button>
        
        {mounted && (
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleTheme}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={cn(
                "h-9 w-9 rounded-full border-border overflow-hidden relative transition-all duration-300",
                theme === 'dark' ? 'bg-slate-800' : 'bg-sky-50',
                theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-sky-100',
                "shadow-sm hover:shadow-md"
              )}
              title={`Switch to ${nextTheme} mode`}
            >
              <span 
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-500 transform",
                  theme === 'dark' 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-10 opacity-0"
                )}
              >
                <Moon className={cn(
                  "h-[18px] w-[18px] text-sky-100",
                  isHovering && "animate-pulse"
                )} />
              </span>
              
              <span 
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-500 transform",
                  theme === 'light' 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-[-10px] opacity-0"
                )}
              >
                <Sun className={cn(
                  "h-[18px] w-[18px] text-amber-500",
                  isHovering && "animate-spin-slow"
                )} />
              </span>
              
              <span className="sr-only">
                {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </span>
            </Button>
            
            {/* Subtle glow effect */}
            <div className={cn(
              "absolute -inset-0.5 rounded-full bg-gradient-to-r blur-sm transition-opacity duration-500",
              theme === 'dark' 
                ? "from-blue-700 to-purple-700 opacity-40" 
                : "from-amber-300 to-yellow-500 opacity-30",
              isHovering ? "opacity-60" : ""
            )} style={{ zIndex: -1 }} />
          </div>
        )}
      </div>
    </header>
  );
}; 