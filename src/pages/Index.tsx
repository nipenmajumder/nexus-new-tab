import { useEffect, useState } from 'react';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { Background } from '@/components/Background';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ClockWidget } from '@/components/widgets/ClockWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { TodoWidget } from '@/components/widgets/TodoWidget';
import { PomodoroWidget } from '@/components/widgets/PomodoroWidget';
import { GoogleAppsWidget } from '@/components/widgets/GoogleAppsWidget';
import { QuoteWidget } from '@/components/widgets/QuoteWidget';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function DashboardContent() {
  const { widgetLayout, isLoading, useLightText } = useSettings();
  const [showContent, setShowContent] = useState(false);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

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

  // Fixed widget order: Clock, Weather, Google Apps (row 1), Quote, Todos, Pomodoro (row 2)
  const widgetOrder = [
    { key: 'clock', component: ClockWidget },
    { key: 'weather', component: WeatherWidget },
    { key: 'googleApps', component: GoogleAppsWidget },
    { key: 'quote', component: QuoteWidget },
    { key: 'todos', component: TodoWidget },
    { key: 'pomodoro', component: PomodoroWidget },
  ];

  const visibleWidgets = widgetOrder.filter(
    (w) => widgetLayout?.[w.key as keyof typeof widgetLayout]?.visible !== false
  );

  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/60' : 'text-gray-600';

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

      {/* Widget Grid - Fixed Order */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleWidgets.map(({ key, component: Component }, index) => (
            <div
              key={key}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
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

// Main Index component with SettingsProvider wrapping all children
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