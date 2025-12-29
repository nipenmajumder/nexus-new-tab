import { useState } from 'react';
import { Plus, GripVertical, Trash2, Sparkles } from 'lucide-react';
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
import { AITool } from '@/lib/storage';
import { cn } from '@/lib/utils';

export function AIToolsWidget() {
  const [tools, setTools] = useStorage('aiTools');
  const { useLightText } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [newColor, setNewColor] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-gray-600';
  const hoverBgClass = useLightText ? 'hover:bg-white/10' : 'hover:bg-gray-100';

  const sortedTools = tools ? [...tools].sort((a, b) => a.order - b.order) : [];

  const addTool = async () => {
    if (!newName.trim() || !newUrl.trim() || !tools) return;

    const tool: AITool = {
      id: Date.now().toString(),
      name: newName.trim(),
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      icon: newIcon || `https://www.google.com/s2/favicons?domain=${newUrl}&sz=64`,
      color: newColor || undefined,
      order: tools.length,
    };

    await setTools([...tools, tool]);
    setNewName('');
    setNewUrl('');
    setNewIcon('');
    setNewColor('');
    setDialogOpen(false);
  };

  const deleteTool = async (id: string) => {
    if (!tools) return;
    const filtered = tools.filter((tool) => tool.id !== id);
    const reordered = filtered.map((tool, index) => ({ ...tool, order: index }));
    await setTools(reordered);
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedId || !tools || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = tools.findIndex((tool) => tool.id === draggedId);
    const targetIndex = tools.findIndex((tool) => tool.id === targetId);

    const newTools = [...tools];
    const [removed] = newTools.splice(draggedIndex, 1);
    newTools.splice(targetIndex, 0, removed);

    const reordered = newTools.map((tool, index) => ({ ...tool, order: index }));
    await setTools(reordered);
    setDraggedId(null);
  };

  if (!tools) return null;

  return (
    <div className="widget animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('flex items-center gap-2', mutedColorClass)}>
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI Tools</span>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Add AI Tool</DialogTitle>
              <DialogDescription>
                Add your favorite AI tool or service
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ChatGPT"
                  onKeyDown={(e) => e.key === 'Enter' && addTool()}
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://chat.openai.com"
                  onKeyDown={(e) => e.key === 'Enter' && addTool()}
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon URL (optional)</Label>
                <Input
                  id="icon"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  onKeyDown={(e) => e.key === 'Enter' && addTool()}
                />
              </div>
              <div>
                <Label htmlFor="color">Brand Color (optional)</Label>
                <Input
                  id="color"
                  type="color"
                  value={newColor || '#3b82f6'}
                  onChange={(e) => setNewColor(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addTool} disabled={!newName.trim() || !newUrl.trim()}>
                Add Tool
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {sortedTools.map((tool) => (
          <div
            key={tool.id}
            draggable
            onDragStart={() => handleDragStart(tool.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(tool.id)}
            className={cn(
              'group relative flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-all',
              hoverBgClass,
              draggedId === tool.id && 'opacity-50'
            )}
          >
            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <GripVertical className={cn('w-3 h-3', mutedColorClass)} />
            </div>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={(e) => {
                  e.preventDefault();
                  deleteTool(tool.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shadow-lg transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: tool.color || '#3b82f6',
                }}
              >
                <img
                  src={tool.icon}
                  alt={tool.name}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`;
                  }}
                />
              </div>
              <span className={cn('text-xs text-center line-clamp-2 font-medium', textColorClass)}>
                {tool.name}
              </span>
            </a>
          </div>
        ))}
      </div>

      {sortedTools.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className={cn('w-12 h-12 mx-auto mb-3', mutedColorClass)} />
          <p className={cn('text-sm mb-2', mutedColorClass)}>
            No AI tools yet
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Tool
          </Button>
        </div>
      )}
    </div>
  );
}
