# Nexus Tab - AI Agent Instructions

## Project Overview
Chrome new tab extension built with React 18 + TypeScript, Vite, and shadcn/ui. Provides customizable widgets (clock, weather, todos, pomodoro, notes, quick links) with persistent storage via Chrome Storage API.

## Architecture

### Storage Pattern
- **Chrome Storage API wrapper** at `src/lib/storage.ts` with dev fallback (mock storage when `chrome.storage` unavailable)
- **Type-safe storage interface** via `StorageData` type - all stored data must be defined here
- **useStorage hook** (`src/hooks/useStorage.ts`) returns `[data, updateData, loading]` tuple
- Storage is **async by default** - always await `updateData()` calls
- Each widget maintains its own storage key (e.g., `todos`, `quickLinks`, `pomodoroSettings`)

### Settings Architecture
- **SettingsContext** (`src/contexts/SettingsContext.tsx`) is the single source of truth for app-wide settings
- Settings include: `fontSettings`, `backgroundSettings`, `widgetLayout`, `clockSettings`, `theme`
- **Auto text color detection**: `useLightText` calculates whether to use light/dark text based on background luminance
- Font loading is **async** - fonts load via Google Fonts API (`src/lib/fonts.ts`), must wait for `fontsInitialized`

### Widget System
- Widgets are in `src/components/widgets/` and follow standard pattern:
  - Use `useStorage` for widget-specific data persistence
  - Import `useSettings` for theme/layout access
  - Respect `useLightText` for text color classes: `text-white` (light) vs `text-gray-900` (dark)
- Widget visibility/order controlled via `widgetLayout` in SettingsContext
- QuickLinks widget is special: rendered separately above main grid, Chrome-style centered layout

### Component Library
- **shadcn/ui components** in `src/components/ui/` - auto-generated, DO NOT manually edit
- Import path alias: `@/` maps to `src/`
- Add new shadcn components: ensure `components.json` config exists, use shadcn CLI
- Custom components use `cn()` utility from `src/lib/utils.ts` for conditional class merging

## Key Patterns

### Text Color Classes
Always use dynamic text colors based on `useLightText`:
```tsx
const { useLightText } = useSettings();
const textColorClass = useLightText ? 'text-white' : 'text-gray-900';
const mutedColorClass = useLightText ? 'text-white/60' : 'text-gray-600';
```

### Widget Layout Sorting
Widgets render in order defined by `widgetLayout[key].order`:
```tsx
const sortedWidgets = widgets
  .filter((w) => widgetLayout?.[w.key]?.visible !== false)
  .sort((a, b) => (widgetLayout?.[a.key]?.order ?? 0) - (widgetLayout?.[b.key]?.order ?? 0));
```

### Chrome Extension Specifics
- `manifest.json` uses Manifest V3 (required for Chrome extensions)
- Permissions in manifest: `storage` for Chrome Storage API, `host_permissions` for external APIs
- Build outputs to `dist/` folder - load this as unpacked extension in Chrome

## Development Workflow

### Commands
- `npm run dev` - Start Vite dev server (port 8080)
- `npm run build` - Production build to `dist/`
- `npm run build:dev` - Development mode build
- `npm run preview` - Preview production build

### Testing Extension
1. `npm run build`
2. Load unpacked extension from `dist/` folder in `chrome://extensions/`
3. Storage changes persist across extension reloads in Chrome

### Adding New Widgets
1. Create component in `src/components/widgets/`
2. Add storage types to `StorageData` interface in `src/lib/storage.ts`
3. Register widget in `Index.tsx` widgets array
4. Add to `WidgetLayout` interface with `visible` and `order` properties

### Font System
- Fonts defined in `src/lib/fonts.ts` with categories: `sans`, `serif`, `mono`
- Google Fonts loaded dynamically - caches loaded fonts to avoid duplicate requests
- Apply fonts by calling `applyFontSettings()` which sets CSS variables on `:root`

## Common Pitfalls

- **Don't forget loading states**: All storage hooks return loading state - handle it before rendering
- **Chrome API availability**: Check `chrome.storage` exists before using - dev mode uses localStorage fallback
- **Text color contrast**: Always use `useLightText` - never hardcode text colors
- **Widget order**: New widgets need explicit `order` value in default `widgetLayout`
- **Manifest permissions**: External API calls require `host_permissions` in `manifest.json`

## External Dependencies

- **OpenWeatherMap API**: Weather widget requires API key stored in `weatherSettings.apiKey`
- **Unsplash**: Background images use `source.unsplash.com` (no API key needed)
- **Google Fonts**: Loaded from `fonts.googleapis.com` (no API key needed)
