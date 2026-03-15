import type { AppSettings } from '../types';
import vocab from '../data/vocab';

const ALL_CATEGORIES = Array.from(new Set(vocab.map((v) => v.category)));

// JLPT level groups — each level bundles its sub-categories
const JLPT_LEVELS = [
  {
    key: 'N5',
    label: 'JLPT N5',
    categories: ALL_CATEGORIES.filter((c) => c.includes('N5')),
  },
  {
    key: 'N4',
    label: 'JLPT N4',
    categories: ALL_CATEGORIES.filter((c) => c.includes('N4')),
  },
  {
    key: 'N3',
    label: 'JLPT N3',
    categories: ALL_CATEGORIES.filter((c) => c.includes('N3')),
  },
].filter((l) => l.categories.length > 0);

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onBack: () => void;
}

export default function Settings({ settings, onUpdate, onBack }: SettingsProps) {
  const allSelected = settings.selectedCategories.length === 0;

  function isLevelActive(levelCategories: string[]): boolean {
    if (allSelected) return true;
    return levelCategories.every((c) => settings.selectedCategories.includes(c));
  }

  function toggleLevel(levelCategories: string[]) {
    if (allSelected) {
      // Deselect this level → keep all other levels active
      const remaining = ALL_CATEGORIES.filter((c) => !levelCategories.includes(c));
      onUpdate({ ...settings, selectedCategories: remaining });
      return;
    }

    const active = isLevelActive(levelCategories);
    if (active) {
      // Remove this level's categories
      const next = settings.selectedCategories.filter((c) => !levelCategories.includes(c));
      // If nothing left, reset to "all" to avoid empty state
      onUpdate({ ...settings, selectedCategories: next.length > 0 ? next : [] });
    } else {
      // Add this level's categories
      const next = [...new Set([...settings.selectedCategories, ...levelCategories])];
      // If all categories are now selected, simplify to "all" (empty array)
      onUpdate({
        ...settings,
        selectedCategories: next.length >= ALL_CATEGORIES.length ? [] : next,
      });
    }
  }

  // Count vocab words active under current filter
  const activeVocabCount = allSelected
    ? vocab.length
    : vocab.filter((v) => settings.selectedCategories.includes(v.category)).length;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 py-4 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-stone-800">Pengaturan</h1>
            <p className="text-xs text-stone-400">Perubahan langsung tersimpan</p>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Cards Per Day */}
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-5">
          <h2 className="font-semibold text-stone-800">Batas Kartu per Hari</h2>

          {/* New cards */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-stone-700">🌱 Kata Baru</p>
                <p className="text-xs text-stone-400">Kata yang belum pernah dipelajari</p>
              </div>
              <span className="text-2xl font-bold text-red-600">{settings.newCardsPerDay}</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={settings.newCardsPerDay}
              onChange={(e) => onUpdate({ ...settings, newCardsPerDay: Number(e.target.value) })}
              className="w-full accent-red-600"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>0</span><span>10</span><span>20</span><span>30</span>
            </div>
          </div>

          {/* Review cards */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-stone-700">📝 Kata Review</p>
                <p className="text-xs text-stone-400">Kata yang sudah dipelajari, perlu diulang</p>
              </div>
              <span className="text-2xl font-bold text-red-600">{settings.reviewCardsPerDay}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={settings.reviewCardsPerDay}
              onChange={(e) => onUpdate({ ...settings, reviewCardsPerDay: Number(e.target.value) })}
              className="w-full accent-red-600"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </div>
        </section>

        {/* Level Filter */}
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-stone-800">Level JLPT</h2>
            <span className="text-xs text-stone-500">{activeVocabCount} kata aktif</span>
          </div>
          <p className="text-xs text-stone-400 mb-5">
            Pilih level yang ingin dipelajari
          </p>

          {/* Level toggle pills */}
          <div className="flex flex-col gap-3">
            {/* Semua button */}
            <button
              onClick={() => onUpdate({ ...settings, selectedCategories: [] })}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all ${
                allSelected
                  ? 'bg-red-600 border-red-600 text-white shadow-md'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-red-300'
              }`}
            >
              Semua Level
              <span className={`ml-2 text-xs font-normal ${allSelected ? 'text-red-200' : 'text-stone-400'}`}>
                {vocab.length} kata
              </span>
            </button>

            {/* Individual level buttons */}
            {JLPT_LEVELS.map((level) => {
              const active = isLevelActive(level.categories);
              const count = vocab.filter((v) => level.categories.includes(v.category)).length;
              return (
                <button
                  key={level.key}
                  onClick={() => toggleLevel(level.categories)}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all ${
                    active && !allSelected
                      ? 'bg-red-600 border-red-600 text-white shadow-md'
                      : allSelected
                      ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-pointer hover:border-stone-300'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-red-300'
                  }`}
                >
                  {level.label}
                  <span
                    className={`ml-2 text-xs font-normal ${
                      active && !allSelected ? 'text-red-200' : 'text-stone-400'
                    }`}
                  >
                    {count} kata
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active hint */}
          <p className="text-xs text-stone-400 text-center mt-4">
            {allSelected
              ? 'Semua level aktif'
              : `${JLPT_LEVELS.filter((l) => isLevelActive(l.categories)).map((l) => l.label).join(' + ')} aktif`}
          </p>
        </section>
      </main>
    </div>
  );
}
