import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Maximize2, Minimize2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStorage } from '@/hooks/useStorage';
import { cn } from '@/lib/utils';

// Debounce utility
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

interface NotesWidgetProps {
  compact?: boolean;
}

export function NotesWidget({ compact = false }: NotesWidgetProps) {
  const [notes, setNotes] = useStorage('notes');
  const [localNotes, setLocalNotes] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

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
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
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
    <motion.div 
      className={cn(
        compact ? 'widget-compact' : 'widget',
        expanded && !compact && 'md:col-span-2 md:row-span-2'
      )}
      layout
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className="widget-header">
        <div className="widget-header-left">
          <StickyNote className="widget-header-icon" />
          <span className="widget-title">Quick Notes</span>
          {isSaving && (
            <motion.span 
              className="text-xs text-muted-foreground ml-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Saving...
            </motion.span>
          )}
          {justSaved && !isSaving && (
            <motion.span 
              className="text-xs text-green-400 ml-2 flex items-center gap-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <Check className="w-3 h-3" />
              Saved
            </motion.span>
          )}
        </div>
        {!compact && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-white/10"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <Textarea
        placeholder="Write your thoughts here..."
        value={localNotes}
        onChange={handleChange}
        className={cn(
          'resize-none bg-background/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 font-body flex-1 transition-all',
          compact ? 'min-h-[80px] text-xs' : expanded ? 'min-h-[300px]' : 'min-h-[180px]'
        )}
      />

      {!compact && (
        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
          <span className="tabular-nums">{charCount.toLocaleString()} characters</span>
          <span className="opacity-60">Auto-saved</span>
        </div>
      )}
    </motion.div>
  );
}
