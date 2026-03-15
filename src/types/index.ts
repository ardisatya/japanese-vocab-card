export interface VocabItem {
  id: string;
  japanese: string;   // kanji form
  hiragana: string;   // hiragana reading
  romaji: string;     // romaji reading
  indonesian: string; // Indonesian translation
  category: string;   // e.g. "kata benda N5", "kata kerja N4"
  example?: {
    japanese: string;
    indonesian: string;
  };
}

export interface SRSCard {
  vocabId: string;
  interval: number;       // days until next review
  repetitions: number;    // number of successful reviews
  easeFactor: number;     // SM-2 ease factor, starts at 2.5
  nextReview: string;     // ISO date string (YYYY-MM-DD)
  lastReview: string | null;
  totalReviews: number;
}

export type StudyMode = 'flashcard' | 'multiple-choice' | 'writing' | 'context-quiz';

export type CardTier = 'learning' | 'reviewing' | 'remembered' | 'mastered';
// learning:   interval 1–7   hari 🌱
// reviewing:  interval 8–21  hari 📝
// remembered: interval 22–90 hari ⭐
// mastered:   interval > 90  hari 🏆

export interface AppSettings {
  newCardsPerDay: number;        // default: 10 — kata baru (belum pernah dipelajari)
  reviewCardsPerDay: number;     // default: 20 — kata yang perlu diulang
  selectedCategories: string[];  // [] = semua kategori aktif
}

export type Screen =
  | { name: 'dashboard' }
  | { name: 'study'; mode: StudyMode }
  | { name: 'complete'; results: StudyResult[] }
  | { name: 'settings' }
  | { name: 'learned-words' }
  | { name: 'word-discovery' };

export interface StudyResult {
  vocabId: string;
  quality: number;  // 0-5 SM-2 quality rating
  correct: boolean;
  mode: StudyMode;
}

export interface AppStats {
  streak: number;
  lastStudyDate: string | null;
  totalStudied: number;
  newCardsToday: number;  // new cards introduced in current day
  newCardsDate: string;   // YYYY-MM-DD — which day newCardsToday belongs to
}
