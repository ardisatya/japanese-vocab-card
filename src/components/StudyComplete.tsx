import type { StudyResult, StudyMode } from '../types';
import vocab from '../data/vocab';

interface StudyCompleteProps {
  results: StudyResult[];
  mode: StudyMode;
  onBack: () => void;
}

const MODE_LABELS: Record<StudyMode, string> = {
  flashcard: 'Flashcard',
  'multiple-choice': 'Pilihan Ganda',
  writing: 'Tulis Jawaban',
  'context-quiz': 'Kuis Konteks',
};

export default function StudyComplete({ results, mode, onBack }: StudyCompleteProps) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const wrong = total - correct;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

  const emoji = pct === 100 ? '🏆' : pct >= 70 ? '🌟' : pct >= 40 ? '💪' : '📖';
  const message =
    pct === 100
      ? 'Sempurna! Luar biasa!'
      : pct >= 70
      ? 'Bagus sekali! Terus semangat!'
      : pct >= 40
      ? 'Terus berlatih, kamu pasti bisa!'
      : 'Jangan menyerah, ulangi lagi!';

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-stone-800">Sesi Selesai!</h2>
          <p className="text-sm text-stone-400">Mode: {MODE_LABELS[mode]}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Score card */}
          <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-8 text-center">
            <div className="text-6xl mb-3">{emoji}</div>
            <div className="text-5xl font-bold text-red-600 mb-1">{pct}%</div>
            <div className="text-stone-500 text-sm mb-4">{message}</div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-700">{total}</div>
                <div className="text-xs text-stone-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{correct}</div>
                <div className="text-xs text-stone-400">Benar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{wrong}</div>
                <div className="text-xs text-stone-400">Salah</div>
              </div>
            </div>
          </div>

          {/* Per-card breakdown */}
          {results.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
                Detail Hasil
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result) => {
                  const item = vocab.find((v) => v.id === result.vocabId);
                  if (!item) return null;
                  return (
                    <div
                      key={result.vocabId}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
                        result.correct
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <span className="text-lg">{result.correct ? '✓' : '✗'}</span>
                      <div className="flex-1">
                        <span className="font-bold text-stone-800">{item.japanese}</span>
                        <span className="text-stone-400 text-sm mx-2">·</span>
                        <span className="text-stone-600 text-sm">{item.indonesian}</span>
                      </div>
                      <span className="text-xs text-stone-400">{item.hiragana}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back button */}
          <button
            onClick={onBack}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 active:scale-95 transition-all shadow-md"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
