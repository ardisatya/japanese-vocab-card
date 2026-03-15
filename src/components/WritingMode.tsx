import { useState, useRef, useEffect } from 'react';
import type { SRSCard, VocabItem } from '../types';
import { QUALITY } from '../utils/srs';

interface WritingModeProps {
  card: SRSCard;
  currentVocab: VocabItem;
  progress: { current: number; total: number; percent: number };
  onAnswer: (quality: number, correct: boolean) => void;
  onExit: () => void;
}

export default function WritingMode({
  card: _card,
  currentVocab,
  progress,
  onAnswer,
  onExit,
}: WritingModeProps) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentVocab.id]);

  const isCorrect = input.trim() === currentVocab.japanese;

  function handleSubmit() {
    if (!input.trim() || submitted) return;
    setSubmitted(true);
  }

  function handleNext() {
    const quality = isCorrect ? QUALITY.GOOD : QUALITY.AGAIN;
    onAnswer(quality, isCorrect);
    setInput('');
    setSubmitted(false);
    setShowHint(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (!submitted) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
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
              <span>Tulis Jawaban</span>
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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-5">
          {/* Category badge */}
          <div className="text-center">
            <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
              {currentVocab.category}
            </span>
          </div>

          {/* Question */}
          <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-8 text-center">
            <p className="text-xs text-stone-400 mb-2">Tulis dalam bahasa Jepang (kanji)</p>
            <div className="text-3xl font-bold text-stone-800 mb-2">{currentVocab.indonesian}</div>
          </div>

          {/* Hint toggle */}
          {!submitted && (
            <button
              onClick={() => setShowHint((h) => !h)}
              className="w-full text-center text-sm text-stone-400 hover:text-red-500 transition-colors py-2"
            >
              {showHint ? `🙈 Sembunyikan hint` : `💡 Tampilkan hint (hiragana)`}
            </button>
          )}
          {showHint && !submitted && (
            <div className="text-center text-2xl text-stone-400 font-medium">
              {currentVocab.hiragana}
            </div>
          )}

          {/* Input */}
          {!submitted ? (
            <div className="space-y-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik kanji di sini..."
                className="writing-input w-full text-center text-3xl font-bold bg-white border-2 border-stone-200 rounded-2xl px-4 py-4 focus:border-red-400 transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="w-full bg-red-600 text-white py-3 rounded-2xl font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
              >
                Periksa Jawaban
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Answer feedback */}
              <div
                className={`rounded-2xl p-5 text-center border-2 ${
                  isCorrect
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                {isCorrect ? (
                  <>
                    <div className="text-4xl mb-1">✓</div>
                    <div className="text-green-700 font-bold text-lg">Benar!</div>
                    <div className="text-3xl font-bold text-green-800 mt-2">{currentVocab.japanese}</div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-1">✗</div>
                    <div className="text-red-700 font-bold text-lg">Jawaban kamu: <span className="text-2xl">{input}</span></div>
                    <div className="text-sm text-red-600 mt-1">Jawaban yang benar:</div>
                    <div className="text-4xl font-bold text-red-800 mt-1">{currentVocab.japanese}</div>
                    <div className="text-lg text-red-600 mt-1">{currentVocab.hiragana}</div>
                  </>
                )}
              </div>

              {/* Example sentence */}
              {currentVocab.example && (
                <div className="bg-stone-100 rounded-2xl px-4 py-3 text-center">
                  <div className="text-sm text-stone-600">{currentVocab.example.japanese}</div>
                  <div className="text-xs text-stone-400 mt-1">{currentVocab.example.indonesian}</div>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-stone-800 text-white py-3 rounded-2xl font-semibold hover:bg-stone-900 transition-all active:scale-95 shadow-md"
              >
                Lanjut →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
