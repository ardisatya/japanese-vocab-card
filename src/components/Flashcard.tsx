import { useState } from 'react';
import type { SRSCard } from '../types';
import type { VocabItem } from '../types';
import { QUALITY } from '../utils/srs';

interface FlashcardProps {
  card: SRSCard;
  vocab: VocabItem;
  progress: { current: number; total: number; percent: number };
  onRate: (quality: number) => void;
  onExit: () => void;
}

export default function Flashcard({ card: _card, vocab, progress, onRate, onExit }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  function handleFlip() {
    setFlipped(true);
  }

  function handleRate(quality: number) {
    onRate(quality);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-stone-400 mb-1">
              <span>Flashcard</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Category badge */}
          <div className="text-center mb-4">
            <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
              {vocab.category}
            </span>
          </div>

          {/* Flip card */}
          <div
            className="card-flip-container w-full"
            style={{ height: '280px' }}
            onClick={!flipped ? handleFlip : undefined}
          >
            <div className={`card-flip-inner h-full ${flipped ? 'flipped' : ''}`}>
              {/* Front */}
              <div className="card-face bg-white rounded-3xl shadow-lg border border-stone-200 flex flex-col items-center justify-center p-8 cursor-pointer hover:shadow-xl transition-shadow">
                <div className="text-6xl font-bold text-stone-800 mb-3">{vocab.japanese}</div>
                <div className="text-2xl text-stone-400">{vocab.hiragana}</div>
                <div className="mt-6 text-xs text-stone-300">Ketuk untuk melihat arti</div>
              </div>

              {/* Back */}
              <div className="card-face card-face-back bg-gradient-to-br from-rose-100 via-pink-50 to-violet-100 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8">
                <div className="text-3xl font-bold text-stone-800 mb-2">{vocab.indonesian}</div>
                <div className="text-lg text-stone-400">{vocab.hiragana}</div>
                {vocab.example && (
                  <div className="mt-5 w-full max-w-xs border border-purple-200 rounded-2xl px-4 py-3 text-center bg-white/60">
                    <div className="text-xs text-purple-400 mb-1.5 tracking-wide uppercase">Contoh Kalimat</div>
                    <div className="text-sm text-stone-700 font-medium">{vocab.example.japanese}</div>
                    <div className="text-xs text-stone-400 mt-1.5 italic">{vocab.example.indonesian}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating buttons — only show after flip */}
          <div className={`mt-6 transition-all duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="text-center text-sm text-stone-400 mb-3">Seberapa ingat kamu?</p>
            <div className="grid grid-cols-4 gap-2">
              <RatingButton label="Lagi" color="bg-red-100 text-red-700 hover:bg-red-200" onClick={() => handleRate(QUALITY.AGAIN)} />
              <RatingButton label="Sulit" color="bg-orange-100 text-orange-700 hover:bg-orange-200" onClick={() => handleRate(QUALITY.HARD)} />
              <RatingButton label="Oke" color="bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleRate(QUALITY.GOOD)} />
              <RatingButton label="Mudah" color="bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => handleRate(QUALITY.EASY)} />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-1">
              <p className="text-center text-xs text-stone-300">besok</p>
              <p className="text-center text-xs text-stone-300">1 hari</p>
              <p className="text-center text-xs text-stone-300">4 hari</p>
              <p className="text-center text-xs text-stone-300">lebih lama</p>
            </div>
          </div>

          {!flipped && (
            <div className="mt-6 text-center">
              <button
                onClick={handleFlip}
                className="bg-red-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-md"
              >
                Tampilkan Jawaban
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${color}`}
    >
      {label}
    </button>
  );
}
