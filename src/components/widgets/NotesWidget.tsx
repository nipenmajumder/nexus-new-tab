import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Check } from 'lucide-react';
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
      {/* Minimal header with status */}
      <div className="flex items-center justify-end gap-2 mb-2">
        {isSaving && (
          <motion.span 
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Saving...
          </motion.span>
        )}
        {justSaved && !isSaving && (
          <motion.span 
            className="text-xs text-green-400 flex items-center gap-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <Check className="w-3 h-3" />
            Saved
          </motion.span>
        )}
        {!compact && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/10"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>

      <Textarea
        placeholder="Write your thoughts..."
        value={localNotes}
        onChange={handleChange}
        className={cn(
          'resize-none bg-background/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 font-body flex-1 transition-all',
          compact ? 'min-h-[100px] text-xs' : expanded ? 'min-h-[200px]' : 'min-h-[160px]'
        )}
      />

      {!compact && (
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span className="tabular-nums">{charCount.toLocaleString()} chars</span>
          <span className="opacity-60">Auto-saved</span>
        </div>
      )}
    </motion.div>
  );
}
