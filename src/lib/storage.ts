// Chrome Storage API wrapper with fallback for development
// Uses chrome.storage.local when available, otherwise falls back to a mock for dev

declare const chrome: {
  storage: {
    local: {
      get: (keys: string | string[] | null, callback: (result: Record<string, any>) => void) => void;
      set: (items: Record<string, any>, callback: () => void) => void;
      clear: (callback: () => void) => void;
    };
  };
} | undefined;

export interface StorageData {
  todos: Todo[];
  quickLinks: QuickLink[];
  notes: string;
  pomodoroSettings: PomodoroSettings;
  pomodoroStats: PomodoroStats;
  widgetLayout: WidgetLayout;
  backgroundSettings: BackgroundSettings;
  fontSettings: FontSettings;
  weatherSettings: WeatherSettings;
  weatherCache: WeatherCache;
  timezones: string[];
  theme: 'light' | 'dark' | 'system';
  clockSettings: ClockSettings;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  createdAt: number;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  order: number;
}

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
}

export interface PomodoroStats {
  totalSessions: number;
  todaySessions: number;
  lastSessionDate: string;
}

export interface WidgetLayout {
  clock: { visible: boolean; order: number };
  weather: { visible: boolean; order: number };
  todos: { visible: boolean; order: number };
  pomodoro: { visible: boolean; order: number };
  notes: { visible: boolean; order: number };
  quickLinks: { visible: boolean; order: number };
}

export interface BackgroundSettings {
  type: 'unsplash' | 'solid' | 'gradient';
  unsplashQuery: string;
  solidColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  blur: number;
  opacity: number;
  lastUnsplashUrl?: string;
  lastUnsplashDate?: string;
  textColor: 'auto' | 'light' | 'dark';
}

export interface ClockSettings {
  use24Hour: boolean;
}

export interface FontSettings {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  scale: 'small' | 'medium' | 'large';
  weight: 'light' | 'regular' | 'medium' | 'bold';
}

export interface WeatherSettings {
  apiKey: string;
  locations: string[];
  currentLocationIndex: number;
  units: 'metric' | 'imperial';
}

export interface WeatherCache {
  [key: string]: {
    data: {
      temp: number;
      description: string;
      icon: string;
      humidity: number;
      windSpeed: number;
      city: string;
      forecast?: Array<{
        date: string;
        temp: number;
        icon: string;
      }>;
    };
    timestamp: number;
    units: 'metric' | 'imperial';
  };
}

const defaultData: StorageData = {
  todos: [],
  quickLinks: [
    { id: '1', title: 'Google', url: 'https://google.com', order: 0 },
    { id: '2', title: 'GitHub', url: 'https://github.com', order: 1 },
    { id: '3', title: 'YouTube', url: 'https://youtube.com', order: 2 },
  ],
  notes: '',
  pomodoroSettings: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
  },
  pomodoroStats: {
    totalSessions: 0,
    todaySessions: 0,
    lastSessionDate: '',
  },
  widgetLayout: {
    clock: { visible: true, order: 0 },
    weather: { visible: true, order: 1 },
    todos: { visible: true, order: 2 },
    pomodoro: { visible: true, order: 3 },
    notes: { visible: true, order: 4 },
    quickLinks: { visible: true, order: 5 },
  },
  backgroundSettings: {
    type: 'gradient',
    unsplashQuery: 'nature,landscape',
    solidColor: '#1a1a2e',
    gradientStart: '#0f0c29',
    gradientEnd: '#302b63',
    gradientAngle: 135,
    blur: 0,
    opacity: 100,
    textColor: 'auto',
  },
  clockSettings: {
    use24Hour: true,
  },
  fontSettings: {
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
    scale: 'medium',
    weight: 'regular',
  },
  weatherSettings: {
    apiKey: '',
    locations: [],
    currentLocationIndex: 0,
    units: 'metric',
  },
  weatherCache: {},
  timezones: ['local'],
  theme: 'dark',
};

// Check if chrome.storage is available
const isChromeStorageAvailable = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
};

// In-memory fallback for development
let memoryStorage: Partial<StorageData> = {};

export async function getStorageData<K extends keyof StorageData>(
  key: K
): Promise<StorageData[K]> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] ?? defaultData[key]);
      });
    });
  }
  
  // Fallback for development
  const stored = localStorage.getItem(`nexus_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultData[key];
    }
  }
  return defaultData[key];
}

export async function setStorageData<K extends keyof StorageData>(
  key: K,
  value: StorageData[K]
): Promise<void> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }
  
  // Fallback for development
  localStorage.setItem(`nexus_${key}`, JSON.stringify(value));
}

export async function getAllStorageData(): Promise<StorageData> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve({ ...defaultData, ...result });
      });
    });
  }
  
  // Fallback for development
  const data: Partial<StorageData> = {};
  for (const key of Object.keys(defaultData) as (keyof StorageData)[]) {
    const stored = localStorage.getItem(`nexus_${key}`);
    if (stored) {
      try {
        data[key] = JSON.parse(stored);
      } catch {
        data[key] = defaultData[key] as any;
      }
    }
  }
  return { ...defaultData, ...data };
}

export async function clearAllStorageData(): Promise<void> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  }
  
  // Fallback for development
  for (const key of Object.keys(defaultData)) {
    localStorage.removeItem(`nexus_${key}`);
  }
}

export { defaultData };
