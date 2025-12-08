import { useState, useEffect } from 'react';
import { Quote, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/hooks/useStorage';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import quotesData from '@/data/quotes.json';

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

  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/60' : 'text-gray-600';
  const borderColorClass = useLightText ? 'border-white/20' : 'border-gray-200';

  // Get a random quote from local JSON
  const getRandomQuote = async () => {
    setIsLoading(true);

    // Small delay for smooth UX
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

  // Load a quote on mount if cache is empty or old (older than 1 hour)
  useEffect(() => {
    const ONE_HOUR = 60 * 60 * 1000;
    if (!quoteCache || Date.now() - quoteCache.fetchedAt > ONE_HOUR) {
      getRandomQuote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        'rounded-2xl backdrop-blur-md flex flex-col',
        useLightText
          ? 'bg-white/10 border border-white/20'
          : 'bg-white/50 border border-gray-200',
        compact ? 'p-4 h-[200px]' : 'p-6 h-full'
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between", compact ? "mb-2" : "mb-4")}>
        <div className="flex items-center gap-2">
          <Quote className={cn(useLightText ? 'text-white' : 'text-gray-900', compact ? "w-4 h-4" : "w-5 h-5")} />
          <h3 className={cn('font-heading font-semibold', textColorClass, compact && "text-sm")}>
            Daily Quote
          </h3>
        </div>
        <Button
          onClick={getRandomQuote}
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0',
            useLightText
              ? 'text-white/60 hover:text-white hover:bg-white/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-black/10'
          )}
          disabled={isLoading}
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Quote Content */}
      {quoteCache ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="relative">
            {!compact && <Sparkles className={cn('w-6 h-6 mb-3 opacity-50', textColorClass)} />}
            <blockquote className="space-y-2">
              <p
                className={cn(
                  'font-medium leading-relaxed italic',
                  textColorClass,
                  compact ? 'text-sm line-clamp-3' : 'text-lg'
                )}
              >
                "{quoteCache.quote}"
              </p>
            </blockquote>
          </div>

          <div className={cn('border-t', borderColorClass, compact ? "mt-2 pt-2" : "mt-6 pt-4")}>
            <p className={cn('font-medium text-right', mutedColorClass, compact ? "text-xs" : "text-sm")}>
              — {quoteCache.author}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className={cn('w-8 h-8 animate-spin mx-auto', mutedColorClass)} />
            <p className={cn('text-sm', mutedColorClass)}>Loading quote...</p>
          </div>
        </div>
      )}
    </div>
  );
}
