import { useEffect, useState } from 'react';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { Background } from '@/components/Background';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ClockWidget } from '@/components/widgets/ClockWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { TodoWidget } from '@/components/widgets/TodoWidget';
import { PomodoroWidget } from '@/components/widgets/PomodoroWidget';
import { QuickLinksWidget } from '@/components/widgets/QuickLinksWidget';
import { GoogleAppsWidget } from '@/components/widgets/GoogleAppsWidget';
import { SearchWidget } from '@/components/widgets/SearchWidget';
import { QuoteWidget } from '@/components/widgets/QuoteWidget';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

function DashboardContent() {
  const { widgetLayout, setWidgetLayout, isLoading, useLightText, dragEnabled } = useSettings();
  const [showContent, setShowContent] = useState(false);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Ensure minimum loading time of 400ms for smooth transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Trigger content display with fade-in after loading completes
  useEffect(() => {
    if (!isLoading && minLoadingComplete) {
      // Small delay to allow skeleton fade-out
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingComplete]);

  const shouldShowSkeleton = isLoading || !minLoadingComplete;

  if (shouldShowSkeleton) {
    return (
      <div className={cn(
        "min-h-screen p-6 md:p-8 lg:p-12 transition-opacity duration-300",
        !isLoading && minLoadingComplete ? "opacity-0" : "opacity-100"
      )}>
        {/* Header Skeleton */}
        <header className="mb-8 text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-2 bg-white/20" />
          <Skeleton className="h-4 w-64 mx-auto bg-white/20" />
        </header>

        {/* Search Skeleton */}
        <div className="max-w-3xl mx-auto mb-8">
          <Skeleton className="h-16 w-full rounded-2xl bg-white/20" />
        </div>

        {/* Quick Links Skeleton */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex flex-wrap justify-center gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
                <Skeleton className="h-3 w-16 bg-white/20" />
              </div>
            ))}
          </div>
        </div>

        {/* Widget Grid Skeleton */}
        <main className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl bg-white/20" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const widgets = [
    { key: 'clock', component: ClockWidget },
    { key: 'weather', component: WeatherWidget },
    { key: 'todos', component: TodoWidget },
    { key: 'pomodoro', component: PomodoroWidget },
    { key: 'googleApps', component: GoogleAppsWidget },
    { key: 'quote', component: QuoteWidget },
  ];

  const sortedWidgets = widgets
    .filter((w) => widgetLayout?.[w.key as keyof typeof widgetLayout]?.visible !== false)
    .sort((a, b) => {
      const orderA = widgetLayout?.[a.key as keyof typeof widgetLayout]?.order ?? 0;
      const orderB = widgetLayout?.[b.key as keyof typeof widgetLayout]?.order ?? 0;
      return orderA - orderB;
    });

  const showQuickLinks = widgetLayout?.quickLinks?.visible !== false;
  const showSearch = widgetLayout?.search?.visible !== false;
  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/60' : 'text-gray-600';

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, widgetKey: string) => {
    setDraggedWidget(widgetKey);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedWidget(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedWidget || !widgetLayout || draggedWidget === targetKey) {
      setDraggedWidget(null);
      return;
    }

    const draggedOrder = widgetLayout[draggedWidget as keyof typeof widgetLayout]?.order ?? 0;
    const targetOrder = widgetLayout[targetKey as keyof typeof widgetLayout]?.order ?? 0;

    // Create new layout with swapped orders
    const newLayout = { ...widgetLayout };
    
    Object.keys(newLayout).forEach((key) => {
      const widget = newLayout[key as keyof typeof widgetLayout];
      if (key === draggedWidget) {
        widget.order = targetOrder;
      } else if (key === targetKey) {
        widget.order = draggedOrder;
      }
    });

    await setWidgetLayout(newLayout);
    setDraggedWidget(null);
  };

  return (
    <div className={cn(
      "min-h-screen p-6 md:p-8 lg:p-12 transition-opacity duration-500",
      showContent ? "opacity-100" : "opacity-0"
    )}>
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className={cn("text-2xl font-heading font-bold mb-1", textColorClass)}>
          Nexus Tab
        </h1>
        <p className={cn("text-sm", mutedColorClass)}>
          Your personalized new tab experience
        </p>
      </header>

      {/* Search Widget - Prominent placement */}
      {showSearch && (
        <div className="max-w-3xl mx-auto mb-8">
          <SearchWidget />
        </div>
      )}

      {/* Quick Links - Chrome style centered */}
      {showQuickLinks && (
        <div className="max-w-2xl mx-auto mb-12">
          <QuickLinksWidget />
        </div>
      )}

      {/* Widget Grid with Drag & Drop */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWidgets.map(({ key, component: Component }, index) => (
            <div
              key={key}
              draggable={dragEnabled}
              onDragStart={dragEnabled ? (e) => handleDragStart(e, key) : undefined}
              onDragEnd={dragEnabled ? handleDragEnd : undefined}
              onDragOver={dragEnabled ? handleDragOver : undefined}
              onDrop={dragEnabled ? (e) => handleDrop(e, key) : undefined}
              className={cn(
                "relative group animate-slide-up transition-all duration-200",
                dragEnabled && "cursor-move",
                draggedWidget === key && "opacity-50 scale-95"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Drag Handle */}
              {dragEnabled && (
                <div className={cn(
                  "absolute -top-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  useLightText 
                    ? "bg-white/20 backdrop-blur-sm text-white" 
                    : "bg-black/10 backdrop-blur-sm text-gray-900"
                )}>
                  <GripVertical className="w-3 h-3" />
                  <span>Drag to reorder</span>
                </div>
              )}
              <Component />
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className={cn("fixed bottom-6 left-6 text-xs", mutedColorClass)}>
        <kbd className={cn(
          "px-1.5 py-0.5 rounded mr-1",
          useLightText ? "bg-white/20" : "bg-black/10"
        )}>Ctrl</kbd>+
        <kbd className={cn(
          "px-1.5 py-0.5 rounded mx-1",
          useLightText ? "bg-white/20" : "bg-black/10"
        )}>K</kbd>
        Search
      </footer>
    </div>
  );
}

const Index = () => {
  return (
    <SettingsProvider>
      <Background />
      <DashboardContent />
      <SettingsPanel />
    </SettingsProvider>
  );
};

export default Index;