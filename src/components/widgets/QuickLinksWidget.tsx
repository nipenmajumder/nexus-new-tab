import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStorage } from '@/hooks/useStorage';
import { useSettings } from '@/contexts/SettingsContext';
import { QuickLink } from '@/lib/storage';
import { cn } from '@/lib/utils';

export function QuickLinksWidget() {
  const [links, setLinks] = useStorage('quickLinks');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const { useLightText } = useSettings();

  const getFavicon = (url: string) => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
      return null;
    }
  };

  const addLink = async () => {
    if (!newTitle.trim() || !newUrl.trim() || !links) return;

    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const link: QuickLink = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url,
      favicon: getFavicon(url) || undefined,
      order: links.length,
    };

    await setLinks([...links, link]);
    setNewTitle('');
    setNewUrl('');
    setDialogOpen(false);
  };

  const updateLink = async (id: string, title: string, url: string) => {
    if (!links) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    await setLinks(
      links.map((link) =>
        link.id === id
          ? { ...link, title: title.trim(), url: formattedUrl, favicon: getFavicon(formattedUrl) || undefined }
          : link
      )
    );
    setEditingId(null);
  };

  const deleteLink = async (id: string) => {
    if (!links) return;
    await setLinks(links.filter((link) => link.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || !links || draggedId === targetId) return;

    const draggedIndex = links.findIndex((l) => l.id === draggedId);
    const targetIndex = links.findIndex((l) => l.id === targetId);

    const newLinks = [...links];
    const [removed] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(targetIndex, 0, removed);

    const orderedLinks = newLinks.map((link, index) => ({ ...link, order: index }));
    await setLinks(orderedLinks);
    setDraggedId(null);
  };

  const textColorClass = useLightText ? 'text-white' : 'text-foreground';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-muted-foreground';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 200, damping: 15 }
    },
  };

  return (
    <motion.div 
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-wrap justify-center gap-8">
        <AnimatePresence mode="popLayout">
          {links?.sort((a, b) => a.order - b.order).map((link) => (
            <motion.div
              key={link.id}
              variants={itemVariants}
              layout
              draggable
              onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, link.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e as unknown as React.DragEvent, link.id)}
              className={cn(
                'group relative flex flex-col items-center cursor-move',
                draggedId === link.id && 'opacity-50'
              )}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {editingId === link.id ? (
                <motion.div 
                  className="w-36 space-y-2 p-4 rounded-xl glass"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Input
                    defaultValue={link.title}
                    className="h-8 text-xs bg-background/50"
                    id={`title-${link.id}`}
                    placeholder="Title"
                  />
                  <Input
                    defaultValue={link.url}
                    className="h-8 text-xs bg-background/50"
                    id={`url-${link.id}`}
                    placeholder="URL"
                  />
                  <div className="flex gap-1 justify-center pt-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-green-500/20"
                      onClick={() => {
                        const titleInput = document.getElementById(`title-${link.id}`) as HTMLInputElement;
                        const urlInput = document.getElementById(`url-${link.id}`) as HTMLInputElement;
                        if (titleInput && urlInput) {
                          updateLink(link.id, titleInput.value, urlInput.value);
                        }
                      }}
                    >
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center group/link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.div 
                      className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center mb-2",
                        "shadow-lg transition-shadow duration-300",
                        useLightText 
                          ? "bg-white/20 backdrop-blur-md border border-white/30 hover:shadow-xl hover:bg-white/30" 
                          : "bg-background/60 backdrop-blur-md border border-border/50 hover:shadow-xl hover:bg-background/80"
                      )}
                      whileHover={{ boxShadow: useLightText ? '0 0 30px rgba(255,255,255,0.3)' : '0 0 30px rgba(0,0,0,0.2)' }}
                    >
                      {link.favicon ? (
                        <img
                          src={link.favicon}
                          alt={link.title}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://www.google.com/s2/favicons?domain=${link.url}&sz=64`;
                          }}
                        />
                      ) : (
                        <ExternalLink className={cn("w-5 h-5", mutedColorClass)} />
                      )}
                    </motion.div>
                    <span className={cn(
                      "text-xs text-center truncate max-w-[80px] font-medium",
                      textColorClass
                    )}>
                      {link.title}
                    </span>
                  </a>
                  
                  {/* Edit/Delete buttons */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-6 w-6 rounded-full shadow-md",
                          useLightText ? "bg-white/40 hover:bg-white/60" : "bg-background/80 hover:bg-background"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingId(link.id);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-6 w-6 rounded-full shadow-md",
                          useLightText ? "bg-white/40 hover:bg-red-500/60" : "bg-background/80 hover:bg-red-500/20"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          deleteLink(link.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add shortcut button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <motion.button 
              className="flex flex-col items-center group"
              variants={itemVariants}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center mb-2",
                "transition-all duration-300 border-2 border-dashed",
                useLightText 
                  ? "border-white/40 hover:border-white/60 hover:bg-white/10" 
                  : "border-muted-foreground/40 hover:border-muted-foreground/60 hover:bg-muted/30"
              )}>
                <Plus className={cn("w-5 h-5", mutedColorClass)} />
              </div>
              <span className={cn("text-xs font-medium", mutedColorClass)}>
                Add shortcut
              </span>
            </motion.button>
          </DialogTrigger>
          <DialogContent className="glass sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Add Quick Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="e.g. Google"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">URL</label>
                <Input
                  placeholder="e.g. https://google.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Button 
                onClick={addLink} 
                className="w-full btn-premium text-primary-foreground"
                disabled={!newTitle.trim() || !newUrl.trim()}
              >
                Add Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}
