import { useState, useCallback, useMemo } from 'react';
import type { SRSCard, AppStats, AppSettings, CardTier } from '../types';
import { createCard, reviewCard, isDue, isLearned, today, getCardTier } from '../utils/srs';
import {
  loadCards, saveCards,
  loadStats, saveStats, updateStreak,
  loadSettings, saveSettings,
} from '../utils/storage';
import vocab from '../data/vocab';

export function useSRS() {
  const [cards, setCards] = useState<Record<string, SRSCard>>(() => {
    const stored = loadCards();
    const merged = { ...stored };
    for (const item of vocab) {
      if (!merged[item.id]) {
        merged[item.id] = createCard(item.id);
      }
    }
    if (Object.keys(merged).length !== Object.keys(stored).length) {
      saveCards(merged);
    }
    return merged;
  });

  const [stats, setStats] = useState<AppStats>(() => loadStats());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Set of vocab IDs that match the active category filter
  const filteredVocabIds = useMemo<Set<string>>(() => {
    if (settings.selectedCategories.length === 0) {
      return new Set(vocab.map((v) => v.id));
    }
    return new Set(
      vocab
        .filter((v) => settings.selectedCategories.includes(v.category))
        .map((v) => v.id),
    );
  }, [settings.selectedCategories]);

  // How many new cards can still be introduced today
  const newCardsRemainingToday = useMemo(() => {
    const todayStr = today();
    const usedToday = stats.newCardsDate === todayStr ? stats.newCardsToday : 0;
    return Math.max(0, settings.newCardsPerDay - usedToday);
  }, [stats.newCardsDate, stats.newCardsToday, settings.newCardsPerDay]);

  // New cards = never studied (repetitions === 0) AND due today, capped by remaining daily quota
  const newCards = useMemo(() => {
    return Object.values(cards)
      .filter((c) => filteredVocabIds.has(c.vocabId) && c.repetitions === 0 && isDue(c))
      .slice(0, newCardsRemainingToday);
  }, [cards, filteredVocabIds, newCardsRemainingToday]);

  // Review cards = previously learned and now due, capped by reviewCardsPerDay
  const reviewCards = useMemo(() => {
    return Object.values(cards)
      .filter((c) => filteredVocabIds.has(c.vocabId) && c.repetitions >= 1 && isDue(c))
      .slice(0, settings.reviewCardsPerDay);
  }, [cards, filteredVocabIds, settings.reviewCardsPerDay]);

  // Combined session queue: review cards first, then new cards
  const dueCards = useMemo(
    () => [...reviewCards, ...newCards],
    [reviewCards, newCards],
  );

  // Total available counts before daily limit (for dashboard display)
  const totalNewCount = useMemo(
    () =>
      Object.values(cards).filter(
        (c) => filteredVocabIds.has(c.vocabId) && c.repetitions === 0 && isDue(c),
      ).length,
    [cards, filteredVocabIds],
  );

  const totalReviewCount = useMemo(
    () =>
      Object.values(cards).filter(
        (c) => filteredVocabIds.has(c.vocabId) && c.repetitions >= 1 && isDue(c),
      ).length,
    [cards, filteredVocabIds],
  );

  // Learned count within the filtered vocab set
  const learnedCount = useMemo(
    () =>
      Object.values(cards).filter(
        (c) => filteredVocabIds.has(c.vocabId) && isLearned(c),
      ).length,
    [cards, filteredVocabIds],
  );

  // All learned cards (across ALL vocab) grouped by performance tier
  const categorizedLearned = useMemo(() => {
    const tiers: Record<CardTier, SRSCard[]> = {
      learning: [],
      reviewing: [],
      remembered: [],
      mastered: [],
    };
    Object.values(cards)
      .filter(isLearned)
      .forEach((card) => {
        tiers[getCardTier(card.interval)].push(card);
      });
    for (const tier of Object.keys(tiers) as CardTier[]) {
      tiers[tier].sort((a, b) => a.nextReview.localeCompare(b.nextReview));
    }
    return tiers;
  }, [cards]);

  const applyReview = useCallback((vocabId: string, quality: number) => {
    setCards((prev) => {
      const card = prev[vocabId];
      if (!card) return prev;
      const updated = reviewCard(card, quality);
      const next = { ...prev, [vocabId]: updated };
      saveCards(next);
      return next;
    });
  }, []);

  const completeSession = useCallback((cardsReviewed: number, newCardsCount: number) => {
    setStats((prev) => {
      const todayStr = today();
      const usedToday = prev.newCardsDate === todayStr ? prev.newCardsToday : 0;
      const updated = updateStreak(
        {
          ...prev,
          totalStudied: prev.totalStudied + cardsReviewed,
          newCardsToday: usedToday + newCardsCount,
          newCardsDate: todayStr,
        },
        todayStr,
      );
      saveStats(updated);
      return updated;
    });
  }, []);

  const updateSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  return {
    cards,
    dueCards,
    newCount: newCards.length,
    reviewCount: reviewCards.length,
    totalNewCount,
    totalReviewCount,
    learnedCount,
    totalCount: vocab.length,
    stats,
    settings,
    categorizedLearned,
    applyReview,
    completeSession,
    updateSettings,
  };
}
