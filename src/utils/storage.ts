import type { SRSCard, AppStats, AppSettings } from '../types';

const KEYS = {
  SRS_CARDS: 'jvc_srs_cards',
  STATS: 'jvc_stats',
  SETTINGS: 'jvc_settings',
} as const;

// ── SRS Cards ────────────────────────────────────────────────────────

export function loadCards(): Record<string, SRSCard> {
  try {
    const raw = localStorage.getItem(KEYS.SRS_CARDS);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SRSCard>;
  } catch {
    return {};
  }
}

export function saveCards(cards: Record<string, SRSCard>): void {
  localStorage.setItem(KEYS.SRS_CARDS, JSON.stringify(cards));
}

// ── Stats ────────────────────────────────────────────────────────────

const defaultStats: AppStats = {
  streak: 0,
  lastStudyDate: null,
  totalStudied: 0,
  newCardsToday: 0,
  newCardsDate: '',
};

export function loadStats(): AppStats {
  try {
    const raw = localStorage.getItem(KEYS.STATS);
    if (!raw) return { ...defaultStats };
    return { ...defaultStats, ...(JSON.parse(raw) as Partial<AppStats>) };
  } catch {
    return { ...defaultStats };
  }
}

export function saveStats(stats: AppStats): void {
  localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
}

// ── Settings ─────────────────────────────────────────────────────────

const defaultSettings: AppSettings = {
  newCardsPerDay: 10,
  reviewCardsPerDay: 20,
  selectedCategories: [],
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

/** Update streak based on whether user studied today. Call after a study session. */
export function updateStreak(stats: AppStats, todayStr: string): AppStats {
  const yesterday = new Date(todayStr);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (stats.lastStudyDate === todayStr) {
    // Already studied today, no change
    return stats;
  } else if (stats.lastStudyDate === yesterdayStr) {
    // Studied yesterday — extend streak
    return { ...stats, streak: stats.streak + 1, lastStudyDate: todayStr };
  } else {
    // Missed a day — reset streak
    return { ...stats, streak: 1, lastStudyDate: todayStr };
  }
}
