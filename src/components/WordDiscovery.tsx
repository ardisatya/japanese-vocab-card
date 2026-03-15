import { useState, useMemo } from 'react';
import type { SRSCard, CardTier } from '../types';
import { vocab } from '../data/vocab';
import { getCardTier } from '../utils/srs';

const PAGE_SIZE = 20;

const TIER_STYLES: Record<CardTier, string> = {
  learning: 'bg-orange-100 text-orange-600',
  reviewing: 'bg-green-100 text-green-600',
  remembered: 'bg-blue-100 text-blue-600',
  mastered: 'bg-amber-100 text-amber-600',
};
const TIER_LABELS: Record<CardTier, string> = {
  learning: 'Baru',
  reviewing: 'Diingat',
  remembered: 'Hafal',
  mastered: 'Mahir',
};

interface WordDiscoveryProps {
  cards: Record<string, SRSCard>;
  onBack: () => void;
}

export default function WordDiscovery({ cards, onBack }: WordDiscoveryProps) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Extract unique levels and types from vocab
  const levels = useMemo(() => {
    const set = new Set<string>();
    vocab.forEach((v) => {
      const m = v.category.match(/N\d/);
      if (m) set.add(m[0]);
    });
    return Array.from(set).sort();
  }, []);

  const types = useMemo(() => {
    const set = new Set<string>();
    vocab.forEach((v) => {
      const t = v.category.replace(/ N\d.*/, '');
      set.add(t);
    });
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return vocab.filter((item) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          item.japanese.includes(q) ||
          item.hiragana.includes(q) ||
          item.romaji.toLowerCase().includes(q) ||
          item.indonesian.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (levelFilter !== 'all' && !item.category.includes(levelFilter)) return false;
      if (typeFilter !== 'all' && !item.category.startsWith(typeFilter)) return false;
      return true;
    });
  }, [search, levelFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function changeFilter(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(0);
    setExpandedId(null);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 pt-4 pb-3 shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="text-stone-400 hover:text-stone-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-stone-800 flex-1">Jelajahi Kosakata</h1>
            <span className="text-sm text-stone-400">{filtered.length} kata</span>
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Cari kata..."
            className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 transition-colors"
          />

          {/* Filter chips */}
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
            <Chip label="Semua" active={levelFilter === 'all'} onClick={() => changeFilter(setLevelFilter, 'all')} />
            {levels.map((l) => (
              <Chip key={l} label={l} active={levelFilter === l} onClick={() => changeFilter(setLevelFilter, l)} />
            ))}
            <span className="w-px bg-stone-200 flex-shrink-0" />
            <Chip label="Semua Jenis" active={typeFilter === 'all'} onClick={() => changeFilter(setTypeFilter, 'all')} />
            {types.map((t) => (
              <Chip key={t} label={t} active={typeFilter === t} onClick={() => changeFilter(setTypeFilter, t)} />
            ))}
          </div>
        </div>
      </div>

      {/* Card list */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-3">
        <div className="space-y-2">
          {pageItems.map((item) => {
            const srs = cards[item.id] ?? null;
            const expanded = expandedId === item.id;
            return (
              <WordCard
                key={item.id}
                item={item}
                srs={srs}
                expanded={expanded}
                onToggle={() => setExpandedId(expanded ? null : item.id)}
              />
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-stone-400 text-sm mt-8">Tidak ada kata yang cocok.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4 pb-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-stone-200 disabled:opacity-30 hover:border-stone-300 transition-colors"
            >
              Prev
            </button>
            <span className="text-sm text-stone-400">
              {safePage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-stone-200 disabled:opacity-30 hover:border-stone-300 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
        active
          ? 'bg-red-600 text-white shadow-sm'
          : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
      }`}
    >
      {label}
    </button>
  );
}

interface WordCardProps {
  item: (typeof vocab)[number];
  srs: SRSCard | null;
  expanded: boolean;
  onToggle: () => void;
}

function WordCard({ item, srs, expanded, onToggle }: WordCardProps) {
  const level = item.category.match(/N\d/)?.[0] ?? '';
  const type = item.category.replace(/ N\d.*/, '');
  const tier: CardTier | null = srs && srs.repetitions >= 1 ? getCardTier(srs.interval) : null;

  return (
    <div
      onClick={onToggle}
      className="bg-white rounded-xl border border-stone-100 shadow-sm px-4 py-3 cursor-pointer hover:shadow-md transition-all"
    >
      {/* Row 1: word */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-stone-800">{item.japanese}</span>
        <span className="text-sm text-stone-400">{item.hiragana}</span>
        <span className="text-sm text-stone-500 flex-1 truncate text-right">{item.indonesian}</span>
      </div>

      {/* Row 2: badges */}
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        {level && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{level}</span>
        )}
        <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{type}</span>
        {tier && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${TIER_STYLES[tier]}`}>
            {TIER_LABELS[tier]}
          </span>
        )}
        {srs && srs.repetitions === 0 && srs.totalReviews === 0 && (
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Belum</span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
          <div className="text-xs text-stone-400">Romaji: {item.romaji}</div>
          {item.example && (
            <div className="bg-stone-50 rounded-xl px-3 py-2.5">
              <div className="text-xs text-stone-400 mb-1">Contoh:</div>
              <div className="text-sm text-stone-700">{item.example.japanese}</div>
              <div className="text-xs text-stone-400 mt-1">{item.example.indonesian}</div>
            </div>
          )}
          {srs && srs.repetitions > 0 && (
            <div className="flex gap-3 text-xs text-stone-400 flex-wrap">
              <span>Interval: {srs.interval} hari</span>
              <span>Review: {srs.totalReviews}x</span>
              <span>Next: {srs.nextReview}</span>
              <span>Ease: {srs.easeFactor.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
