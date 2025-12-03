import { useEffect } from 'react';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { Background } from '@/components/Background';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ClockWidget } from '@/components/widgets/ClockWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { TodoWidget } from '@/components/widgets/TodoWidget';
import { PomodoroWidget } from '@/components/widgets/PomodoroWidget';
import { NotesWidget } from '@/components/widgets/NotesWidget';
import { QuickLinksWidget } from '@/components/widgets/QuickLinksWidget';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function DashboardContent() {
  const { widgetLayout, isLoading, useLightText } = useSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const widgets = [
    { key: 'clock', component: ClockWidget },
    { key: 'weather', component: WeatherWidget },
    { key: 'todos', component: TodoWidget },
    { key: 'pomodoro', component: PomodoroWidget },
    { key: 'notes', component: NotesWidget },
  ];

  const sortedWidgets = widgets
    .filter((w) => widgetLayout?.[w.key as keyof typeof widgetLayout]?.visible !== false)
    .sort((a, b) => {
      const orderA = widgetLayout?.[a.key as keyof typeof widgetLayout]?.order ?? 0;
      const orderB = widgetLayout?.[b.key as keyof typeof widgetLayout]?.order ?? 0;
      return orderA - orderB;
    });

  const showQuickLinks = widgetLayout?.quickLinks?.visible !== false;
  const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
  const mutedColorClass = useLightText ? 'text-white/60' : 'text-gray-600';

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className={cn("text-2xl font-heading font-bold mb-1", textColorClass)}>
          Nexus Tab
        </h1>
        <p className={cn("text-sm", mutedColorClass)}>
          Your personalized new tab experience
        </p>
      </header>

      {/* Quick Links - Chrome style centered */}
      {showQuickLinks && (
        <div className="max-w-2xl mx-auto mb-12">
          <QuickLinksWidget />
        </div>
      )}

      {/* Widget Grid */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWidgets.map(({ key, component: Component }) => (
            <div key={key} className="animate-slide-up" style={{ animationDelay: `${sortedWidgets.findIndex(w => w.key === key) * 100}ms` }}>
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