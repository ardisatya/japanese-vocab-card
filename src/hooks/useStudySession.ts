import { useState, useCallback } from 'react';
import type { SRSCard, StudyResult, StudyMode } from '../types';
import vocab from '../data/vocab';

interface SessionState {
  queue: SRSCard[];
  currentIndex: number;
  results: StudyResult[];
}

export function useStudySession(dueCards: SRSCard[], mode: StudyMode) {
  // For context-quiz, only use cards whose example contains the japanese word (valid cloze)
  const [effectiveCards] = useState(() => {
    if (mode !== 'context-quiz') return dueCards;
    return dueCards.filter((c) => {
      const v = vocab.find((vi) => vi.id === c.vocabId);
      return v?.example && v.example.japanese.includes(v.japanese);
    });
  });

  const [newCardsInSession] = useState(() =>
    effectiveCards.filter((c) => c.repetitions === 0).length,
  );

  const [session, setSession] = useState<SessionState>(() => ({
    queue: shuffleArray([...effectiveCards]),
    currentIndex: 0,
    results: [],
  }));

  const current = session.queue[session.currentIndex] ?? null;
  const currentVocab = current
    ? vocab.find((v) => v.id === current.vocabId) ?? null
    : null;

  const isComplete = session.currentIndex >= session.queue.length;

  /** Record a result and advance to the next card */
  const submitResult = useCallback((quality: number, correct: boolean) => {
    setSession((prev) => {
      const card = prev.queue[prev.currentIndex];
      if (!card) return prev;
      const result: StudyResult = {
        vocabId: card.vocabId,
        quality,
        correct,
        mode,
      };
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        results: [...prev.results, result],
      };
    });
  }, [mode]);

  const progress = {
    current: session.currentIndex + 1,
    total: session.queue.length,
    percent:
      session.queue.length === 0
        ? 100
        : Math.round((session.currentIndex / session.queue.length) * 100),
  };

  return {
    current,
    currentVocab,
    isComplete,
    results: session.results,
    progress,
    submitResult,
    newCardsInSession,
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
