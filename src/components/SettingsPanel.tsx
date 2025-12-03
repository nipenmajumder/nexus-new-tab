import { useState } from 'react';
import { Settings, Sun, Moon, Monitor, Palette, Type, Layout, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { fontOptions, allFonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const gradientPresets = [
  { name: 'Midnight', start: '#0f0c29', end: '#302b63' },
  { name: 'Ocean', start: '#141E30', end: '#243B55' },
  { name: 'Aurora', start: '#1a1a2e', end: '#16213e' },
  { name: 'Sunset', start: '#2b1055', end: '#7597de' },
  { name: 'Forest', start: '#0d3331', end: '#1d976c' },
  { name: 'Berry', start: '#2d1f3d', end: '#614385' },
];

export function SettingsPanel() {
  const {
    theme,
    setTheme,
    fontSettings,
    setFontSettings,
    backgroundSettings,
    setBackgroundSettings,
    widgetLayout,
    setWidgetLayout,
  } = useSettings();

  const [open, setOpen] = useState(false);

  const updateFontSetting = async (key: string, value: string) => {
    if (fontSettings) {
      await setFontSettings({ ...fontSettings, [key]: value });
    }
  };

  const updateBackgroundSetting = async (key: string, value: any) => {
    if (backgroundSettings) {
      await setBackgroundSettings({ ...backgroundSettings, [key]: value });
    }
  };

  const toggleWidget = async (widgetKey: string) => {
    if (widgetLayout) {
      const widget = widgetLayout[widgetKey as keyof typeof widgetLayout];
      await setWidgetLayout({
        ...widgetLayout,
        [widgetKey]: { ...widget, visible: !widget.visible },
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full glass hover:scale-105 transition-transform z-50"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="glass w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">Settings</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="appearance" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="appearance" className="text-xs">
              <Palette className="w-4 h-4 mr-1" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="background" className="text-xs">
              <Sun className="w-4 h-4 mr-1" />
              Background
            </TabsTrigger>
            <TabsTrigger value="fonts" className="text-xs">
              <Type className="w-4 h-4 mr-1" />
              Fonts
            </TabsTrigger>
            <TabsTrigger value="widgets" className="text-xs">
              <Layout className="w-4 h-4 mr-1" />
              Widgets
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Color Mode</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
                      'border border-border/50 hover:border-primary/50',
                      theme === value && 'bg-primary/10 border-primary'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="space-y-6 mt-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Background Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {['gradient', 'solid', 'unsplash'].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateBackgroundSetting('type', type)}
                    className={cn(
                      'p-3 rounded-xl border border-border/50 capitalize text-sm',
                      'hover:border-primary/50 transition-all',
                      backgroundSettings?.type === type && 'bg-primary/10 border-primary'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {backgroundSettings?.type === 'gradient' && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Gradient Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        updateBackgroundSetting('gradientStart', preset.start);
                        updateBackgroundSetting('gradientEnd', preset.end);
                      }}
                      className="group relative h-16 rounded-lg overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${preset.start}, ${preset.end})`,
                      }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs mb-1 block">Start Color</Label>
                    <Input
                      type="color"
                      value={backgroundSettings?.gradientStart || '#0f0c29'}
                      onChange={(e) => updateBackgroundSetting('gradientStart', e.target.value)}
                      className="w-full h-10 p-1 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">End Color</Label>
                    <Input
                      type="color"
                      value={backgroundSettings?.gradientEnd || '#302b63'}
                      onChange={(e) => updateBackgroundSetting('gradientEnd', e.target.value)}
                      className="w-full h-10 p-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {backgroundSettings?.type === 'solid' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Solid Color</Label>
                <Input
                  type="color"
                  value={backgroundSettings?.solidColor || '#1a1a2e'}
                  onChange={(e) => updateBackgroundSetting('solidColor', e.target.value)}
                  className="w-full h-12 p-1 cursor-pointer"
                />
              </div>
            )}

            {backgroundSettings?.type === 'unsplash' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Search Query</Label>
                <Input
                  placeholder="nature, landscape, abstract..."
                  value={backgroundSettings?.unsplashQuery || ''}
                  onChange={(e) => updateBackgroundSetting('unsplashQuery', e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Images refresh daily from Unsplash
                </p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Blur: {backgroundSettings?.blur || 0}px
              </Label>
              <Slider
                value={[backgroundSettings?.blur || 0]}
                onValueChange={([value]) => updateBackgroundSetting('blur', value)}
                max={20}
                step={1}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Overlay Opacity: {backgroundSettings?.opacity || 100}%
              </Label>
              <Slider
                value={[backgroundSettings?.opacity || 100]}
                onValueChange={([value]) => updateBackgroundSetting('opacity', value)}
                max={100}
                step={5}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Text Color</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'auto', label: 'Auto' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateBackgroundSetting('textColor', value)}
                    className={cn(
                      'p-3 rounded-xl border border-border/50 capitalize text-sm',
                      'hover:border-primary/50 transition-all',
                      backgroundSettings?.textColor === value && 'bg-primary/10 border-primary'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Auto adjusts based on background brightness
              </p>
            </div>
          </TabsContent>

          {/* Fonts Tab */}
          <TabsContent value="fonts" className="space-y-6 mt-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Heading Font</Label>
              <Select
                value={fontSettings?.headingFont || 'Space Grotesk'}
                onValueChange={(value) => updateFontSetting('headingFont', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allFonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Body Font</Label>
              <Select
                value={fontSettings?.bodyFont || 'Inter'}
                onValueChange={(value) => updateFontSetting('bodyFont', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allFonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Monospace Font</Label>
              <Select
                value={fontSettings?.monoFont || 'JetBrains Mono'}
                onValueChange={(value) => updateFontSetting('monoFont', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.mono.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Font Scale</Label>
              <div className="grid grid-cols-3 gap-2">
                {['small', 'medium', 'large'].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => updateFontSetting('scale', scale)}
                    className={cn(
                      'p-2 rounded-lg border border-border/50 capitalize text-sm',
                      'hover:border-primary/50 transition-all',
                      fontSettings?.scale === scale && 'bg-primary/10 border-primary'
                    )}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Font Weight</Label>
              <div className="grid grid-cols-4 gap-2">
                {['light', 'regular', 'medium', 'bold'].map((weight) => (
                  <button
                    key={weight}
                    onClick={() => updateFontSetting('weight', weight)}
                    className={cn(
                      'p-2 rounded-lg border border-border/50 capitalize text-sm',
                      'hover:border-primary/50 transition-all',
                      fontSettings?.weight === weight && 'bg-primary/10 border-primary'
                    )}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Preview */}
            <div className="p-4 rounded-xl bg-background/30 border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <h3 className="text-2xl font-heading mb-2">Heading Font</h3>
              <p className="font-body mb-2">This is body text to preview your font selection.</p>
              <code className="font-mono text-sm">const code = "monospace";</code>
            </div>
          </TabsContent>

          {/* Widgets Tab */}
          <TabsContent value="widgets" className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground">Toggle widgets visibility</p>
            {widgetLayout &&
              Object.entries(widgetLayout).map(([key, config]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/30"
                >
                  <Label className="capitalize">{key}</Label>
                  <Switch
                    checked={config.visible}
                    onCheckedChange={() => toggleWidget(key)}
                  />
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
