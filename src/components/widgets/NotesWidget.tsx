import { useState, useEffect, useCallback } from 'react';
import { StickyNote, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStorage } from '@/hooks/useStorage';
import { cn } from '@/lib/utils';

export function NotesWidget() {
  const [notes, setNotes] = useStorage('notes');
  const [localNotes, setLocalNotes] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local notes with storage
  useEffect(() => {
    if (notes !== null) {
      setLocalNotes(notes);
    }
  }, [notes]);

  // Debounced save
  const debouncedSave = useCallback(
    debounce(async (value: string) => {
      setIsSaving(true);
      await setNotes(value);
      setIsSaving(false);
    }, 500),
    [setNotes]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalNotes(value);
    debouncedSave(value);
  };

  const charCount = localNotes.length;

  return (
    <div className={cn('widget animate-fade-in transition-all', expanded && 'col-span-2 row-span-2')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <StickyNote className="w-4 h-4" />
          <span className="text-sm font-medium">Quick Notes</span>
          {isSaving && (
            <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      <Textarea
        placeholder="Write your thoughts here..."
        value={localNotes}
        onChange={handleChange}
        className={cn(
          'resize-none bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 font-body flex-1',
          expanded ? 'min-h-[300px]' : ''
        )}
      />

      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>{charCount} characters</span>
        <span className="opacity-50">Auto-saved</span>
      </div>
    </div>
  );
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}
