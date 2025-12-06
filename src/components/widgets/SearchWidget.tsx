import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

export function SearchWidget() {
  const { useLightText } = useSettings();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSearch}>
        <motion.div 
          className={cn(
            "glass-card p-2 transition-all duration-300",
            isFocused && "shadow-xl ring-2 ring-primary/20"
          )}
          animate={{ 
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="relative flex items-center">
            <Search className={cn(
              "absolute left-4 w-5 h-5 transition-colors duration-200",
              isFocused 
                ? (useLightText ? "text-white" : "text-primary")
                : (useLightText ? "text-white/50" : "text-muted-foreground")
            )} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search the web..."
              className={cn(
                "pl-12 pr-12 py-6 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 transition-all",
                useLightText 
                  ? "placeholder:text-white/40 text-white" 
                  : "placeholder:text-muted-foreground text-foreground"
              )}
            />
            {query && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  "absolute right-3 p-2 rounded-full transition-colors",
                  useLightText 
                    ? "bg-white/20 hover:bg-white/30 text-white" 
                    : "bg-primary/10 hover:bg-primary/20 text-primary"
                )}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
        <p className={cn(
          "text-xs text-center mt-3 transition-opacity",
          useLightText ? "text-white/50" : "text-muted-foreground"
        )}>
          Press <kbd className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-mono mx-1",
            useLightText ? "bg-white/20" : "bg-muted"
          )}>Enter</kbd> to search with Google
        </p>
      </form>
    </motion.div>
  );
}
