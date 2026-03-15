import { useState } from 'react';
import type { SRSCard, CardTier } from '../types';
import vocab from '../data/vocab';

interface TierConfig {
  label: string;
  icon: string;
  activeBar: string;
  tabColor: string;
  badgeBg: string;
  badgeText: string;
}

const TIER_CONFIG: Record<CardTier, TierConfig> = {
  mastered: {
    label: 'Mahir',
    icon: '🏆',
    activeBar: 'border-amber-500',
    tabColor: 'text-amber-600',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  remembered: {
    label: 'Hafal',
    icon: '⭐',
    activeBar: 'border-blue-500',
    tabColor: 'text-blue-600',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
  reviewing: {
    label: 'Diingat',
    icon: '📝',
    activeBar: 'border-green-500',
    tabColor: 'text-green-600',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
  },
  learning: {
    label: 'Baru',
    icon: '🌱',
    activeBar: 'border-orange-500',
    tabColor: 'text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
  },
};

const TIER_BAR_COLORS: Record<CardTier, string> = {
  mastered: 'bg-amber-400',
  remembered: 'bg-blue-400',
  reviewing: 'bg-green-400',
  learning: 'bg-orange-400',
};

const TIER_ORDER: CardTier[] = ['mastered', 'remembered', 'reviewing', 'learning'];

const PAGE_SIZE = 10;

interface LearnedWordsProps {
  categorizedLearned: Record<CardTier, SRSCard[]>;
  totalVocabCount: number;
  onBack: () => void;
}

export default function LearnedWords({
  categorizedLearned,
  totalVocabCount,
  onBack,
}: LearnedWordsProps) {
  const [activeTier, setActiveTier] = useState<CardTier>('learning');
  const [page, setPage] = useState(0);

  const totalLearned = TIER_ORDER.reduce((sum, t) => sum + categorizedLearned[t].length, 0);

  const cards = categorizedLearned[activeTier];
  const cfg = TIER_CONFIG[activeTier];
  const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  const pageCards = cards.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function selectTier(tier: CardTier) {
    setActiveTier(tier);
    setPage(0);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 pt-4 pb-3 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-base font-bold text-stone-800">Kata yang Dipelajari</h1>
          <span className="text-sm font-bold text-stone-700">
            {totalLearned}
            <span className="font-normal text-stone-400">/{totalVocabCount}</span>
          </span>
        </div>

        {/* Tier breakdown progress bar */}
        <div className="max-w-lg mx-auto mt-2.5 flex h-2 rounded-full overflow-hidden gap-0.5 bg-stone-100">
          {TIER_ORDER.map((tier) => {
            const count = categorizedLearned[tier].length;
            const pct = totalVocabCount === 0 ? 0 : (count / totalVocabCount) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={tier}
                className={`${TIER_BAR_COLORS[tier]} rounded-full`}
                style={{ width: `${pct}%` }}
                title={`${TIER_CONFIG[tier].label}: ${count}`}
              />
            );
          })}
        </div>
      </div>

      {/* Tier tabs */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-lg mx-auto flex">
          {TIER_ORDER.map((tier) => {
            const c = TIER_CONFIG[tier];
            const isActive = tier === activeTier;
            return (
              <button
                key={tier}
                onClick={() => selectTier(tier)}
                className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 border-b-2 transition-colors ${
                  isActive ? `${c.activeBar} ${c.tabColor}` : 'border-transparent text-stone-400'
                }`}
              >
                <span className="text-base leading-none">{c.icon}</span>
                <span className="text-xs font-semibold">{c.label}</span>
                <span className="text-xs font-bold">{categorizedLearned[tier].length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card list */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-3">
        {cards.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-3xl mb-2">{cfg.icon}</div>
            <p className="text-sm">Belum ada kata di level ini</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {pageCards.map((card) => {
              const item = vocab.find((v) => v.id === card.vocabId);
              if (!item) return null;
              const daysUntil = daysUntilReview(card.nextReview);
              return (
                <div
                  key={card.vocabId}
                  className="bg-white rounded-xl border border-stone-100 shadow-sm flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-stone-800">{item.japanese}</span>
                      <span className="text-xs text-stone-400">{item.hiragana}</span>
                    </div>
                    <div className="text-sm text-stone-500 truncate">{item.indonesian}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                      {daysUntil <= 0 ? 'Due' : `${daysUntil}h lagi`}
                    </span>
                    <div className="text-xs text-stone-300 mt-0.5">{card.repetitions}×</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-stone-200 px-4 py-3 max-w-lg mx-auto w-full flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-sm px-4 py-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
          >
            ← Sebelumnya
          </button>
          <span className="text-sm text-stone-500">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-sm px-4 py-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Berikutnya →
          </button>
        </div>
      )}
    </div>
  );
}

function daysUntilReview(nextReview: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(nextReview);
  next.setHours(0, 0, 0, 0);
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
