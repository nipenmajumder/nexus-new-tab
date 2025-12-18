import { useState } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/hooks/useStorage';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import quotesData from '@/data/quotes.json';
import { useEffect } from 'react';

interface QuoteData {
  quote: string;
  author: string;
  fetchedAt: number;
}

interface QuoteWidgetProps {
  compact?: boolean;
}

export function QuoteWidget({ compact = false }: QuoteWidgetProps) {
  const [quoteCache, setQuoteCache] = useStorage('quoteCache');
  const [isLoading, setIsLoading] = useState(false);
  const { useLightText } = useSettings();

  // Use semantic tokens for consistent theming
  const textColorClass = useLightText ? 'text-white' : 'text-foreground';
  const mutedColorClass = useLightText ? 'text-white/60' : 'text-muted-foreground';
  const borderColorClass = useLightText ? 'border-white/20' : 'border-border';

  const getRandomQuote = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      const randomIndex = Math.floor(Math.random() * quotesData.length);
      const selectedQuote = quotesData[randomIndex];
      const quoteData: QuoteData = {
        quote: selectedQuote.quote,
        author: selectedQuote.author,
        fetchedAt: Date.now(),
      };
      await setQuoteCache(quoteData);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    const ONE_HOUR = 60 * 60 * 1000;
    if (!quoteCache || Date.now() - quoteCache.fetchedAt > ONE_HOUR) {
      getRandomQuote();
    }
  }, []);

  return (
    <div className={cn(compact ? 'widget-compact' : 'widget')}>
      {/* Minimal header with refresh */}
      <div className="flex items-center justify-end mb-2">
        <Button
          onClick={getRandomQuote}
          variant="ghost"
          size="sm"
          className={cn(
            'h-6 w-6 p-0',
            useLightText
              ? 'text-white/60 hover:text-white hover:bg-white/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          disabled={isLoading}
        >
          <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Quote Content */}
      {quoteCache ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="relative flex-1">
            {!compact && <Quote className={cn('w-5 h-5 mb-2 opacity-40', textColorClass)} />}
            <blockquote>
              <p className={cn(
                'font-medium leading-relaxed italic',
                textColorClass,
                compact ? 'text-sm line-clamp-3' : 'text-base line-clamp-4'
              )}>
                "{quoteCache.quote}"
              </p>
            </blockquote>
          </div>

          <div className={cn('border-t', borderColorClass, compact ? "mt-2 pt-2" : "mt-3 pt-3")}>
            <p className={cn('font-medium text-right', mutedColorClass, compact ? "text-xs" : "text-sm")}>
              — {quoteCache.author}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className={cn('w-6 h-6 animate-spin', mutedColorClass)} />
        </div>
      )}
    </div>
  );
}
