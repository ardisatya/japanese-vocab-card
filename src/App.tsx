import { useEffect } from 'react';
import type { Screen, StudyMode, StudyResult } from './types';
import { useState } from 'react';
import { useSRS } from './hooks/useSRS';
import { useStudySession } from './hooks/useStudySession';
import Dashboard from './components/Dashboard';
import Flashcard from './components/Flashcard';
import MultipleChoice from './components/MultipleChoice';
import WritingMode from './components/WritingMode';
import StudyComplete from './components/StudyComplete';
import Settings from './components/Settings';
import LearnedWords from './components/LearnedWords';
import WordDiscovery from './components/WordDiscovery';
import SentenceQuiz from './components/SentenceQuiz';

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'dashboard' });
  const {
    cards,
    dueCards,
    newCount,
    reviewCount,
    totalNewCount,
    totalReviewCount,
    learnedCount,
    totalCount,
    stats,
    settings,
    categorizedLearned,
    applyReview,
    completeSession,
    updateSettings,
  } = useSRS();

  function handleStartStudy(mode: StudyMode) {
    setScreen({ name: 'study', mode });
  }

  function handleSessionComplete(results: StudyResult[], newCardsCount: number) {
    completeSession(results.length, newCardsCount);
    setScreen({ name: 'complete', results });
  }

  function handleBack() {
    setScreen({ name: 'dashboard' });
  }

  if (screen.name === 'dashboard') {
    return (
      <Dashboard
        dueCards={dueCards}
        newCount={newCount}
        reviewCount={reviewCount}
        totalNewCount={totalNewCount}
        totalReviewCount={totalReviewCount}
        learnedCount={learnedCount}
        totalCount={totalCount}
        stats={stats}
        settings={settings}
        onStartStudy={handleStartStudy}
        onOpenSettings={() => setScreen({ name: 'settings' })}
        onOpenLearnedWords={() => setScreen({ name: 'learned-words' })}
        onOpenWordDiscovery={() => setScreen({ name: 'word-discovery' })}
      />
    );
  }

  if (screen.name === 'settings') {
    return (
      <Settings
        settings={settings}
        onUpdate={updateSettings}
        onBack={handleBack}
      />
    );
  }

  if (screen.name === 'learned-words') {
    return (
      <LearnedWords
        categorizedLearned={categorizedLearned}
        totalVocabCount={totalCount}
        onBack={handleBack}
      />
    );
  }

  if (screen.name === 'word-discovery') {
    return <WordDiscovery cards={cards} onBack={handleBack} />;
  }

  if (screen.name === 'complete') {
    return (
      <StudyComplete
        results={screen.results}
        mode={screen.results[0]?.mode ?? 'flashcard'}
        onBack={handleBack}
      />
    );
  }

  // Study screen
  return (
    <StudyScreen
      mode={screen.mode}
      dueCards={dueCards}
      onApplyReview={applyReview}
      onComplete={handleSessionComplete}
      onExit={handleBack}
    />
  );
}

// ── Study Screen ──────────────────────────────────────────────────────

interface StudyScreenProps {
  mode: StudyMode;
  dueCards: ReturnType<typeof useSRS>['dueCards'];
  onApplyReview: (vocabId: string, quality: number) => void;
  onComplete: (results: StudyResult[], newCardsCount: number) => void;
  onExit: () => void;
}

function StudyScreen({ mode, dueCards, onApplyReview, onComplete, onExit }: StudyScreenProps) {
  const { current, currentVocab, isComplete, results, progress, submitResult, newCardsInSession } =
    useStudySession(dueCards, mode);

  useEffect(() => {
    if (isComplete && results.length > 0) {
      onComplete(results, newCardsInSession);
    }
  }, [isComplete, results, newCardsInSession, onComplete]);

  if (isComplete || !current || !currentVocab) {
    return null;
  }

  function handleRate(quality: number) {
    if (!current) return;
    applyAndSubmit(current.vocabId, quality, quality >= 3);
  }

  function handleAnswer(quality: number, correct: boolean) {
    if (!current) return;
    applyAndSubmit(current.vocabId, quality, correct);
  }

  function applyAndSubmit(vocabId: string, quality: number, correct: boolean) {
    onApplyReview(vocabId, quality);
    submitResult(quality, correct);
  }

  if (mode === 'flashcard') {
    return (
      <Flashcard
        key={currentVocab.id}
        card={current}
        vocab={currentVocab}
        progress={progress}
        onRate={handleRate}
        onExit={onExit}
      />
    );
  }

  if (mode === 'multiple-choice') {
    return (
      <MultipleChoice
        key={currentVocab.id}
        card={current}
        currentVocab={currentVocab}
        progress={progress}
        onAnswer={handleAnswer}
        onExit={onExit}
      />
    );
  }

  if (mode === 'context-quiz') {
    return (
      <SentenceQuiz
        key={currentVocab.id}
        card={current}
        currentVocab={currentVocab}
        progress={progress}
        onAnswer={handleAnswer}
        onExit={onExit}
      />
    );
  }

  return (
    <WritingMode
      card={current}
      currentVocab={currentVocab}
      progress={progress}
      onAnswer={handleAnswer}
      onExit={onExit}
    />
  );
}
