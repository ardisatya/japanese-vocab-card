import { useState, useEffect, useMemo } from 'react';
import type { SRSCard, VocabItem } from '../types';
import { QUALITY } from '../utils/srs';
import vocab from '../data/vocab';

interface MultipleChoiceProps {
  card: SRSCard;
  currentVocab: VocabItem;
  progress: { current: number; total: number; percent: number };
  onAnswer: (quality: number, correct: boolean) => void;
  onExit: () => void;
}

export default function MultipleChoice({
  card: _card,
  currentVocab,
  progress,
  onAnswer,
  onExit,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const isAnswered = selected !== null;
  const isCorrect = selected === currentVocab.indonesian;

  // Build 4 choices: 1 correct + 3 random distractors
  const choices = useMemo(() => {
    const others = vocab
      .filter((v) => v.id !== currentVocab.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.indonesian);
    return shuffleArray([currentVocab.indonesian, ...others]);
  }, [currentVocab.id, currentVocab.indonesian]);

  // Auto-advance after 1.5s
  useEffect(() => {
    if (!isAnswered) return;
    // Hint penalty: correct with hint = quality 3 (correct but difficult), without hint = GOOD (4)
    const quality = isCorrect ? (usedHint ? 3 : QUALITY.GOOD) : QUALITY.AGAIN;
    const timer = setTimeout(() => {
      onAnswer(quality, isCorrect);
      setSelected(null);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAnswered, isCorrect, usedHint, onAnswer]);

  function handleSelect(choice: string) {
    if (isAnswered) return;
    setSelected(choice);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={onExit} className="text-stone-400 hover:text-stone-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-stone-400 mb-1">
              <span>Pilihan Ganda</span>
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

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Category badge */}
          <div className="text-center">
            <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
              {currentVocab.category}
            </span>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-8 text-center">
            <p className="text-xs text-stone-400 mb-2">Apa artinya?</p>
            <div className="text-6xl font-bold text-stone-800 mb-3">{currentVocab.japanese}</div>
            {usedHint ? (
              <div className="text-xl text-stone-400">{currentVocab.hiragana}</div>
            ) : (
              <button
                onClick={() => setUsedHint(true)}
                className="text-sm text-stone-300 hover:text-stone-500 border border-stone-200 hover:border-stone-300 px-3 py-1 rounded-full transition-colors mt-1"
              >
                Tampilkan hint
              </button>
            )}
          </div>

          {/* Answer choices */}
          <div className="grid grid-cols-1 gap-3">
            {choices.map((choice) => {
              let bg = 'bg-white border-stone-200 hover:border-red-400 hover:shadow-md';
              let text = 'text-stone-800';
              if (isAnswered && choice === currentVocab.indonesian) {
                bg = 'bg-green-500 border-green-500 shadow-lg';
                text = 'text-white';
              } else if (isAnswered && choice === selected) {
                bg = 'bg-red-500 border-red-500 shadow-lg';
                text = 'text-white';
              }
              return (
                <button
                  key={choice}
                  onClick={() => handleSelect(choice)}
                  disabled={isAnswered}
                  className={`w-full py-4 px-5 rounded-2xl border-2 text-left font-medium transition-all active:scale-95 ${bg} ${text}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {/* Feedback message */}
          {isAnswered && (
            <div className={`text-center py-3 rounded-2xl font-semibold ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isCorrect ? '✓ Benar!' : `✗ Kurang tepat — jawabannya: ${currentVocab.indonesian}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
