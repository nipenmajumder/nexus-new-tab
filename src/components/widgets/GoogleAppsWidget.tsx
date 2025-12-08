import { useState } from 'react';
import { Plus, GripVertical, Trash2, ExternalLink } from 'lucide-react';
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

export function GoogleAppsWidget({ compact = false }: GoogleAppsWidgetProps) {
  const [apps, setApps] = useStorage('googleApps');
  const { useLightText } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-gray-600';
  const hoverBgClass = useLightText ? 'hover:bg-white/10' : 'hover:bg-gray-100';

  const sortedApps = apps ? [...apps].sort((a, b) => a.order - b.order) : [];

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

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedId || !apps || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = apps.findIndex((app) => app.id === draggedId);
    const targetIndex = apps.findIndex((app) => app.id === targetId);

    const newApps = [...apps];
    const [removed] = newApps.splice(draggedIndex, 1);
    newApps.splice(targetIndex, 0, removed);

    const reordered = newApps.map((app, index) => ({ ...app, order: index }));
    await setApps(reordered);
    setDraggedId(null);
  };

  if (!apps) return null;

  return (
    <div className={cn("animate-fade-in", compact ? 'widget-compact' : 'widget')}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn('flex items-center gap-2', mutedColorClass)}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <span className="text-sm font-medium">Google Apps</span>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Add Google App</DialogTitle>
              <DialogDescription>
                Add a custom Google service or any other app
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="YouTube"
                  onKeyDown={(e) => e.key === 'Enter' && addApp()}
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://youtube.com"
                  onKeyDown={(e) => e.key === 'Enter' && addApp()}
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon URL (optional)</Label>
                <Input
                  id="icon"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  onKeyDown={(e) => e.key === 'Enter' && addApp()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addApp} disabled={!newName.trim() || !newUrl.trim()}>
                Add App
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className={cn("grid gap-2", compact ? "grid-cols-4" : "grid-cols-4 gap-3")}>
        {(compact ? sortedApps.slice(0, 8) : sortedApps).map((app) => (
          <div
            key={app.id}
            draggable
            onDragStart={() => handleDragStart(app.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(app.id)}
            className={cn(
              'group relative flex flex-col items-center gap-1 rounded-lg cursor-pointer transition-all',
              hoverBgClass,
              draggedId === app.id && 'opacity-50',
              compact ? 'p-2' : 'p-3 gap-2'
            )}
          >
            {!compact && (
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className={cn('w-3 h-3', mutedColorClass)} />
              </div>
            )}
            {!compact && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={(e) => {
                  e.preventDefault();
                  deleteApp(app.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cn(
                "rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md",
                compact ? "w-8 h-8" : "w-12 h-12"
              )}>
                <img
                  src={app.icon}
                  alt={app.name}
                  className={compact ? "w-5 h-5 object-contain" : "w-8 h-8 object-contain"}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://www.google.com/s2/favicons?domain=${app.url}&sz=64`;
                  }}
                />
              </div>
              {!compact && (
                <span className={cn('text-xs text-center line-clamp-2', textColorClass)}>
                  {app.name}
                </span>
              )}
            </a>
          </div>
        ))}
      </div>

      {sortedApps.length === 0 && (
        <div className="text-center py-8">
          <svg className={cn('w-12 h-12 mx-auto mb-3', mutedColorClass)} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <p className={cn('text-sm mb-2', mutedColorClass)}>
            No Google apps yet
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add App
          </Button>
        </div>
      )}
    </div>
  );
}
