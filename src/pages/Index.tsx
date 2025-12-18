import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { Background } from '@/components/Background';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ClockWidget } from '@/components/widgets/ClockWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { TodoWidget } from '@/components/widgets/TodoWidget';
import { PomodoroWidget } from '@/components/widgets/PomodoroWidget';
import { NotesWidget } from '@/components/widgets/NotesWidget';
import { QuickLinksWidget } from '@/components/widgets/QuickLinksWidget';
import { GoogleAppsWidget } from '@/components/widgets/GoogleAppsWidget';
import { AIToolsWidget } from '@/components/widgets/AIToolsWidget';
import { QuoteWidget } from '@/components/widgets/QuoteWidget';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

function DashboardContent() {
  const { widgetLayout, setWidgetLayout, isLoading, useLightText, dragEnabled, compactMode } = useSettings();
  const [showContent, setShowContent] = useState(false);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Ensure minimum loading time of 500ms for smooth transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Trigger content display with fade-in after loading completes
  useEffect(() => {
    if (!isLoading && minLoadingComplete) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingComplete]);

  const shouldShowSkeleton = isLoading || !minLoadingComplete;

  // Get enabled widgets for skeleton display
  const getEnabledWidgetCount = () => {
    if (!widgetLayout) return 6;
    return Object.entries(widgetLayout)
      .filter(([key, config]) => config.visible && key !== 'quickLinks' && key !== 'search')
      .length;
  };

  if (shouldShowSkeleton) {
    const enabledCount = getEnabledWidgetCount();
    return (
      <motion.div 
        className="min-h-screen p-4 md:p-6 lg:p-8"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Skeleton */}
        <header className="mb-6 text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-2 bg-white/20" />
          <Skeleton className="h-4 w-64 mx-auto bg-white/20" />
        </header>

        {/* Quick Links Skeleton - only if enabled */}
        {widgetLayout?.quickLinks?.visible !== false && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-wrap justify-center gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-14 h-14 rounded-full bg-white/20" />
                  <Skeleton className="h-3 w-16 bg-white/20" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Widget Grid Skeleton - only for enabled widgets */}
        <main className="max-w-7xl mx-auto">
          <div className={cn(
            "grid gap-4",
            compactMode 
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {[...Array(Math.min(enabledCount, 6))].map((_, i) => (
              <Skeleton key={i} className={cn(
                "rounded-2xl bg-white/20",
                compactMode ? "h-[180px]" : "h-[280px]"
              )} />
            ))}
          </div>
        </main>
      </motion.div>
    );
  }

  const widgets = [
    { key: 'clock', component: ClockWidget },
    { key: 'weather', component: WeatherWidget },
    { key: 'todos', component: TodoWidget },
    { key: 'pomodoro', component: PomodoroWidget },
    { key: 'notes', component: NotesWidget },
    { key: 'googleApps', component: GoogleAppsWidget },
    { key: 'aiTools', component: AIToolsWidget },
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
  const textColorClass = useLightText ? 'text-white' : 'text-foreground';
  const mutedColorClass = useLightText ? 'text-white/60' : 'text-muted-foreground';

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
    <AnimatePresence mode="wait">
      {showContent && (
        <motion.div 
          className="h-screen overflow-hidden flex flex-col p-4 md:p-6 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <motion.header 
            className="mb-4 text-center shrink-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className={cn(
              "text-2xl font-heading font-bold tracking-tight",
              textColorClass
            )}>
              <span className="gradient-text">Nexus</span> Tab
            </h1>
          </motion.header>

          {/* Quick Links - Chrome style centered */}
          {showQuickLinks && (
            <motion.div 
              className="max-w-3xl mx-auto mb-6 shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <QuickLinksWidget />
            </motion.div>
          )}

          {/* Widget Grid with Drag & Drop - fills remaining space */}
          <motion.main 
            className="max-w-7xl mx-auto w-full flex-1 min-h-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className={cn(
              "grid gap-3 h-full auto-rows-fr",
              compactMode 
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
              {sortedWidgets.map(({ key, component: Component }) => (
                <motion.div
                  key={key}
                  variants={itemVariants}
                  draggable={dragEnabled}
                  onDragStart={dragEnabled ? (e) => handleDragStart(e as unknown as React.DragEvent, key) : undefined}
                  onDragEnd={dragEnabled ? (e) => handleDragEnd(e as unknown as React.DragEvent) : undefined}
                  onDragOver={dragEnabled ? (e) => handleDragOver(e as unknown as React.DragEvent) : undefined}
                  onDrop={dragEnabled ? (e) => handleDrop(e as unknown as React.DragEvent, key) : undefined}
                  className={cn(
                    "relative group",
                    dragEnabled && "cursor-move",
                    draggedWidget === key && "opacity-50 scale-95"
                  )}
                  whileHover={{ scale: dragEnabled ? 1 : 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Drag Handle */}
                  {dragEnabled && (
                    <div className={cn(
                      "absolute -top-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300",
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md",
                      useLightText 
                        ? "bg-white/20 text-white border border-white/20" 
                        : "bg-foreground/10 text-foreground border border-foreground/10"
                    )}>
                      <GripVertical className="w-3 h-3" />
                    </div>
                  )}
                  <Component compact={compactMode} />
                </motion.div>
              ))}
            </div>
          </motion.main>
        </motion.div>
      )}
    </AnimatePresence>
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
