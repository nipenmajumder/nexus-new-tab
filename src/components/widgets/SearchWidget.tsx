import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

export function SearchWidget() {
  const { useLightText } = useSettings();
  const [query, setQuery] = useState('');

  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-gray-600';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Use browser's default search engine by navigating to the search query
    // This respects the user's browser settings without requiring engine selection
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in">
      <form onSubmit={handleSearch} className="glass-card p-6 rounded-2xl">
        <div className="relative">
          <Search className={cn('absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5', mutedColorClass)} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web..."
            className={cn(
              'pl-12 pr-4 py-6 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              useLightText ? 'bg-white/5 placeholder:text-white/40' : 'bg-gray-50 placeholder:text-gray-400',
              textColorClass
            )}
            autoFocus
          />
        </div>
        <p className={cn('text-xs text-center mt-3', mutedColorClass)}>
          Press Enter to search with your browser's default search engine
        </p>
      </form>
    </div>
  );
}
