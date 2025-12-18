import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useStorage } from '@/hooks/useStorage';
import { useSettings } from '@/contexts/SettingsContext';
import { GoogleApp } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface GoogleAppsWidgetProps {
  compact?: boolean;
}

const APPS_PER_PAGE = 8;

export function GoogleAppsWidget({ compact = false }: GoogleAppsWidgetProps) {
  const [apps, setApps] = useStorage('googleApps');
  const [currentPage, setCurrentPage] = useStorage('googleAppsPage');
  const { useLightText } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('');

  const textColorClass = useLightText ? 'text-white' : 'text-foreground';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-muted-foreground';
  const hoverBgClass = useLightText ? 'hover:bg-white/10' : 'hover:bg-muted/50';

  const sortedApps = apps ? [...apps].sort((a, b) => a.order - b.order) : [];
  const totalPages = Math.ceil(sortedApps.length / APPS_PER_PAGE);
  const page = currentPage ?? 0;
  const paginatedApps = sortedApps.slice(page * APPS_PER_PAGE, (page + 1) * APPS_PER_PAGE);

  const addApp = async () => {
    if (!newName.trim() || !newUrl.trim() || !apps) return;

    const app: GoogleApp = {
      id: Date.now().toString(),
      name: newName.trim(),
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      icon: newIcon || `https://www.google.com/s2/favicons?domain=${newUrl}&sz=64`,
      order: apps.length,
    };

    await setApps([...apps, app]);
    setNewName('');
    setNewUrl('');
    setNewIcon('');
    setDialogOpen(false);
  };

  const deleteApp = async (id: string) => {
    if (!apps) return;
    const filtered = apps.filter((app) => app.id !== id);
    const reordered = filtered.map((app, index) => ({ ...app, order: index }));
    await setApps(reordered);
  };

  const goToPage = async (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      await setCurrentPage(newPage);
    }
  };

  if (!apps) return null;

  return (
    <div className={cn("animate-fade-in", compact ? 'widget-compact' : 'widget')}>
      {/* Minimal header with add button */}
      <div className="flex items-center justify-end mb-3">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-3 h-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Add App</DialogTitle>
              <DialogDescription>Add a custom service or app</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="YouTube" onKeyDown={(e) => e.key === 'Enter' && addApp()} />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input id="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://youtube.com" onKeyDown={(e) => e.key === 'Enter' && addApp()} />
              </div>
              <div>
                <Label htmlFor="icon">Icon URL (optional)</Label>
                <Input id="icon" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} placeholder="https://example.com/icon.png" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addApp} disabled={!newName.trim() || !newUrl.trim()}>Add App</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Apps grid */}
      <div className={cn("grid gap-2 flex-1", compact ? "grid-cols-4" : "grid-cols-4 gap-3")}>
        {paginatedApps.map((app) => (
          <div
            key={app.id}
            className={cn(
              'group relative flex flex-col items-center gap-1 rounded-lg transition-all',
              hoverBgClass,
              compact ? 'p-2' : 'p-2'
            )}
          >
            {!compact && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-1 -right-1 h-5 w-5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-500/10 z-10"
                onClick={(e) => { e.preventDefault(); deleteApp(app.id); }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
            <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 w-full">
              <div className={cn("rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md", compact ? "w-8 h-8" : "w-10 h-10")}>
                <img src={app.icon} alt={app.name} className={compact ? "w-5 h-5 object-contain" : "w-6 h-6 object-contain"} onError={(e) => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${app.url}&sz=64`; }} />
              </div>
              {!compact && <span className={cn('text-xs text-center line-clamp-1', textColorClass)}>{app.name}</span>}
            </a>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => goToPage(page - 1)} disabled={page === 0}>
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => goToPage(i)} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === page ? "bg-primary w-3" : "bg-muted-foreground/30 hover:bg-muted-foreground/50")} />
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => goToPage(page + 1)} disabled={page >= totalPages - 1}>
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}

      {sortedApps.length === 0 && (
        <div className="text-center py-6">
          <p className={cn('text-sm mb-2', mutedColorClass)}>No apps yet</p>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}><Plus className="w-3 h-3 mr-1" />Add App</Button>
        </div>
      )}
    </div>
  );
}
