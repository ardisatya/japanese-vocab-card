import type { SRSCard, StudyMode, AppStats, AppSettings } from '../types';
import vocab from '../data/vocab';

interface DashboardProps {
  dueCards: SRSCard[];
  newCount: number;
  reviewCount: number;
  totalNewCount: number;
  totalReviewCount: number;
  learnedCount: number;
  totalCount: number;
  stats: AppStats;
  settings: AppSettings;
  onStartStudy: (mode: StudyMode) => void;
  onOpenSettings: () => void;
  onOpenLearnedWords: () => void;
  onOpenWordDiscovery: () => void;
}

export default function Dashboard({
  dueCards,
  newCount,
  reviewCount,
  totalNewCount,
  totalReviewCount,
  learnedCount,
  totalCount,
  stats,
  settings,
  onStartStudy,
  onOpenSettings,
  onOpenLearnedWords,
  onOpenWordDiscovery,
}: DashboardProps) {
  const dueCount = dueCards.length;
  const hasDue = dueCount > 0;
  const isFiltered = settings.selectedCategories.length > 0;
  const previewCards = dueCards.slice(0, 5);

  // Build active filter chip labels
  const filterChips: string[] = [];
  if (isFiltered) {
    const levels = new Set(
      settings.selectedCategories.map((c) => {
        if (c.includes('N5')) return 'N5';
        if (c.includes('N4')) return 'N4';
        return c;
      }),
    );
    filterChips.push([...levels].join(', '));
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-600 tracking-tight">日本語カード</h1>
            <p className="text-xs text-stone-500 mt-0.5">Belajar Kosakata Jepang</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-stone-800">{stats.streak}</div>
              <div className="text-xs text-stone-500">🔥 Hari berturut</div>
            </div>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-all"
              title="Pengaturan"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {filterChips.length > 0 && (
          <div className="max-w-lg mx-auto px-4 pb-3 flex gap-2 flex-wrap">
            {filterChips.map((chip) => (
              <span
                key={chip}
                className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium"
              >
                {chip}
              </span>
            ))}
            <button
              onClick={onOpenSettings}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors"
            >
              Ubah →
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="📝 Review"
            value={reviewCount}
            subValue={totalReviewCount > reviewCount ? `dari ${totalReviewCount}` : undefined}
            color={reviewCount > 0 ? 'text-orange-600' : 'text-stone-400'}
            bg={reviewCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-stone-200'}
          />
          <StatCard
            label="🌱 Kata Baru"
            value={newCount}
            subValue={totalNewCount > newCount ? `dari ${totalNewCount}` : undefined}
            color={newCount > 0 ? 'text-blue-600' : 'text-stone-400'}
            bg={newCount > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-stone-200'}
          />
          <StatCard
            label="Sudah Hafal"
            value={learnedCount}
            color="text-green-600"
            bg="bg-green-50 border-green-200"
          />
          <StatCard
            label="Total Kartu"
            value={totalCount}
            color="text-stone-600"
            bg="bg-white border-stone-200"
          />
        </div>

        {/* Learned Words button */}
        <button
          onClick={onOpenLearnedWords}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-stone-300 hover:shadow-md transition-all text-left"
        >
          <span className="text-xl">📚</span>
          <div className="flex-1">
            <span className="font-semibold text-stone-700">Kata yang Dipelajari</span>
            <span className="text-stone-400 text-sm ml-2">({learnedCount} kata)</span>
          </div>
          <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Word Discovery button */}
        <button
          onClick={onOpenWordDiscovery}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-stone-300 hover:shadow-md transition-all text-left"
        >
          <span className="text-xl">🔍</span>
          <div className="flex-1">
            <span className="font-semibold text-stone-700">Jelajahi Kosakata</span>
            <span className="text-stone-400 text-sm ml-2">({totalCount} kata)</span>
          </div>
          <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Study Mode Buttons */}
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
            Mulai Belajar
          </h2>
          <div className="space-y-3">
            <ModeButton
              icon="🃏"
              title="Flashcard"
              subtitle="Balik kartu, ingat artinya"
              mode="flashcard"
              disabled={!hasDue}
              onClick={onStartStudy}
            />
            <ModeButton
              icon="✅"
              title="Pilihan Ganda"
              subtitle="Pilih arti yang benar dari 4 opsi"
              mode="multiple-choice"
              disabled={!hasDue}
              onClick={onStartStudy}
            />
            <ModeButton
              icon="✍️"
              title="Tulis Jawaban"
              subtitle="Ketik kanji yang benar"
              mode="writing"
              disabled={!hasDue}
              onClick={onStartStudy}
            />
            <ModeButton
              icon="📖"
              title="Kuis Konteks"
              subtitle="Tebak kata dari contoh kalimat"
              mode="context-quiz"
              disabled={!hasDue}
              onClick={onStartStudy}
            />
          </div>

          {!hasDue && (
            <p className="mt-3 text-center text-sm text-stone-400">
              {isFiltered
                ? 'Tidak ada kartu due di kategori yang dipilih. 🎉'
                : 'Tidak ada kartu yang harus direview hari ini. Bagus! 🎉'}
            </p>
          )}
        </section>

        {/* Due Cards Preview */}
        {hasDue && (
          <section>
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
              Kartu Hari Ini ({reviewCount > 0 ? `${reviewCount} review` : ''}{reviewCount > 0 && newCount > 0 ? ' + ' : ''}{newCount > 0 ? `${newCount} baru` : ''})
            </h2>
            <div className="space-y-2">
              {previewCards.map((card) => {
                const item = vocab.find((v) => v.id === card.vocabId);
                if (!item) return null;
                return (
                  <div
                    key={card.vocabId}
                    className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-stone-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-stone-800">{item.japanese}</span>
                      <span className="text-sm text-stone-400">{item.hiragana}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      {card.repetitions === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          Baru
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {dueCount > 5 && (
                <p className="text-center text-sm text-stone-400">+ {dueCount - 5} kartu lainnya</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
  color,
  bg,
}: {
  label: string;
  value: number;
  subValue?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-2xl border px-3 py-4 text-center ${bg}`}>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      {subValue && <div className="text-xs text-stone-400 -mt-0.5">{subValue}</div>}
      <div className="text-xs text-stone-500 mt-1 leading-tight">{label}</div>
    </div>
  );
}

function ModeButton({
  icon,
  title,
  subtitle,
  mode,
  disabled,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  mode: StudyMode;
  disabled: boolean;
  onClick: (mode: StudyMode) => void;
}) {
  return (
    <button
      onClick={() => onClick(mode)}
      disabled={disabled}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border text-left transition-all
        ${
          disabled
            ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
            : 'bg-white border-stone-200 hover:border-red-400 hover:shadow-md active:scale-98 cursor-pointer shadow-sm'
        }`}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className={`font-semibold ${disabled ? 'text-stone-400' : 'text-stone-800'}`}>
          {title}
        </div>
        <div className="text-xs text-stone-400 mt-0.5">{subtitle}</div>
      </div>
      {!disabled && (
        <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}
