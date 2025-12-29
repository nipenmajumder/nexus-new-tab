import { useState } from 'react';
import { Music, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStorage } from '@/hooks/useStorage';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

export function MusicWidget() {
  const [musicServices, setMusicServices] = useStorage('musicServices');
  const [defaultService, setDefaultService] = useStorage('defaultMusicService');
  const { useLightText } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'spotify' | 'youtube'>(defaultService || 'spotify');

  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/70' : 'text-gray-600';

  const currentService = musicServices?.find((s) => s.name === activeTab);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const searchUrl =
      activeTab === 'spotify'
        ? `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`
        : `https://music.youtube.com/search?q=${encodeURIComponent(searchQuery)}`;

    window.open(searchUrl, '_blank', 'noopener,noreferrer');
    setSearchQuery('');
  };

  const handleTabChange = async (value: string) => {
    const service = value as 'spotify' | 'youtube';
    setActiveTab(service);
    await setDefaultService(service);
  };

  if (!musicServices) return null;

  return (
    <div className="widget animate-fade-in">
      <div className={cn('flex items-center gap-2 mb-4', mutedColorClass)}>
        <Music className="w-4 h-4" />
        <span className="text-sm font-medium">Music</span>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="spotify" className="text-xs">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotify
          </TabsTrigger>
          <TabsTrigger value="youtube" className="text-xs">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            YouTube
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', mutedColorClass)} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search on ${activeTab === 'spotify' ? 'Spotify' : 'YouTube Music'}...`}
                className="pl-10"
              />
            </div>
          </form>

          <div className="space-y-2">
            {currentService?.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg transition-colors group',
                  useLightText ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                )}
              >
                <span className={cn('text-sm font-medium', textColorClass)}>
                  {link.title}
                </span>
                <ExternalLink className={cn('w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity', mutedColorClass)} />
              </a>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className={cn('mt-4 pt-4 border-t text-xs text-center', mutedColorClass)}>
        Press Enter to search
      </div>
    </div>
  );
}
