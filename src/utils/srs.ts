import type { SRSCard, CardTier } from '../types';

const DEFAULT_EASE_FACTOR = 2.5;

/** Return today's local date as YYYY-MM-DD */
export function today(): string {
  return formatLocalDate(new Date());
}

/** Add `days` to a YYYY-MM-DD date string, return new YYYY-MM-DD string */
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/** Format a Date as YYYY-MM-DD using local timezone */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Create a brand-new SRSCard for a vocab item (due today) */
export function createCard(vocabId: string): SRSCard {
  return {
    vocabId,
    interval: 0,
    repetitions: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    nextReview: today(),
    lastReview: null,
    totalReviews: 0,
  };
}

/**
 * SM-2 algorithm — update a card after a review.
 *
 * quality: 0-5
 *   0 = complete blackout (Again)
 *   2 = wrong, but correct answer remembered (Hard fail)
 *   3 = correct with significant difficulty (Hard pass)
 *   4 = correct after hesitation (Good)
 *   5 = perfect, immediate recall (Easy)
 */
export function reviewCard(card: SRSCard, quality: number): SRSCard {
  let { interval, repetitions, easeFactor } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    // Update ease factor (clamp to minimum 1.3)
    easeFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
    );
    repetitions += 1;
  } else {
    // Wrong response — reset
    repetitions = 0;
    interval = 1;
  }

  return {
    ...card,
    interval,
    repetitions,
    easeFactor,
    nextReview: addDays(today(), interval),
    lastReview: today(),
    totalReviews: card.totalReviews + 1,
  };
}

/** Check if a card is due for review today or earlier */
export function isDue(card: SRSCard): boolean {
  return card.nextReview <= today();
}

/** Check if a card has been learned at least once */
export function isLearned(card: SRSCard): boolean {
  return card.repetitions >= 1;
}

// Quality helpers for different study modes
export const QUALITY = {
  AGAIN: 0,
  HARD: 2,
  GOOD: 4,
  EASY: 5,
} as const;

/** Classify a learned card into one of 4 performance tiers based on interval */
export function getCardTier(interval: number): CardTier {
  if (interval <= 7)  return 'learning';
  if (interval <= 21) return 'reviewing';
  if (interval <= 90) return 'remembered';
  return 'mastered';
}
