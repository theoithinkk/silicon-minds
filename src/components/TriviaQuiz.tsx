import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Award, Share2, Check } from 'lucide-react';

interface Question {
  id: string;
  eraId: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

interface Era { id: string; name: string; order: number; }
interface Props { questions: Question[]; eras: Era[]; }

const ERA_LABELS: Record<string, string> = {
  'birth-of-mobile-cpus': 'Birth of Mobile CPUs',
  'arm-revolution':        'ARM Revolution',
  'multicore-era':         'Multicore Era',
  'system-on-chip-era':    'SoC Era',
  'ai-efficiency-era':     'AI & Efficiency',
};

const ERA_COLORS: Record<string, string> = {
  'birth-of-mobile-cpus': '#22D3EE',
  'arm-revolution': '#34D399',
  'multicore-era': '#F59E0B',
  'system-on-chip-era': '#A78BFA',
  'ai-efficiency-era': '#F472B6',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface ShuffledQuestion {
  original: Question;
  shuffledOptions: string[];
  correctShuffledIndex: number;
}

function buildQuiz(questions: Question[]): ShuffledQuestion[] {
  const ERA_IDS = ['birth-of-mobile-cpus','arm-revolution','multicore-era','system-on-chip-era','ai-efficiency-era'];
  const byEra: Record<string, Question[]> = {};
  for (const id of ERA_IDS) byEra[id] = shuffle(questions.filter(q => q.eraId === id));
  const picked: Question[] = [];
  for (const id of ERA_IDS) picked.push(...byEra[id].slice(0, 3));
  const remaining = shuffle(questions.filter(q => !picked.includes(q)));
  picked.push(...remaining.slice(0, 15 - picked.length));
  return shuffle(picked).map(q => {
    const shuffled = shuffle(q.options);
    return { original: q, shuffledOptions: shuffled, correctShuffledIndex: shuffled.indexOf(q.options[q.correctIndex]) };
  });
}

export default function TriviaQuiz({ questions, eras }: Props) {
  const prefersReduced = useReducedMotion();
  const quiz = useMemo(() => buildQuiz(questions), []);

  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [copied, setCopied] = useState(false);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const q = quiz[current];
  const eraColor = ERA_COLORS[q.original.eraId] ?? '#22D3EE';

  const choose = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    setResults(prev => [...prev, idx === q.correctShuffledIndex]);
    setTimeout(() => nextBtnRef.current?.focus(), 350);
  };

  const next = () => {
    if (current + 1 >= quiz.length) { setFinished(true); }
    else { setCurrent(c => c + 1); setAnswered(null); }
  };

  const restart = () => { setCurrent(0); setAnswered(null); setResults([]); setFinished(false); setCopied(false); };

  const eraBreakdown = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    for (const id of Object.keys(ERA_LABELS)) map[id] = { correct: 0, total: 0 };
    quiz.forEach((sq, i) => {
      const eraId = sq.original.eraId;
      if (!map[eraId]) map[eraId] = { correct: 0, total: 0 };
      map[eraId].total++;
      if (results[i]) map[eraId].correct++;
    });
    return map;
  }, [results, finished]);

  // ── Score screen ───────────────────────────────────────────
  if (finished) {
    const total   = results.length;
    const correct = results.filter(Boolean).length;
    const pct     = Math.round((correct / total) * 100);
    const grade   = pct >= 80 ? 'Excellent.' : pct >= 60 ? 'Good work.' : 'Keep exploring.';
    const scoreGradient = pct >= 80
      ? 'linear-gradient(135deg, #34D399, #22D3EE)'
      : pct >= 60
        ? 'linear-gradient(135deg, #F59E0B, #FBBF24)'
        : 'linear-gradient(135deg, #F472B6, #EF4444)';

    const share = async () => {
      const lines = eras.map(e => {
        const d = eraBreakdown[e.id] ?? { correct: 0, total: 0 };
        return `  ${ERA_LABELS[e.id] ?? e.id}: ${d.correct}/${d.total}`;
      }).join('\n');
      const text = `Silicon Minds Trivia — ${correct}/${total} (${pct}%)\n${lines}`;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* clipboard unavailable — no-op */ }
    };

    return (
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        role="region" aria-label="Quiz results" style={{ maxWidth: 560 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={18} style={{ color: 'var(--ui-primary)' }} aria-hidden="true" />
          </div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, color: 'var(--text-primary)' }}>Your Results</h3>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 54, lineHeight: 1, background: scoreGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
            {correct}<span style={{ fontSize: 26, opacity: 0.6 }}>/{total}</span>
          </p>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 16 }}>{pct}% correct — {grade}</p>
        </div>

        <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 14 }}>Per-Era Breakdown</h4>
        <dl style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {eras.map(era => {
            const d = eraBreakdown[era.id] ?? { correct: 0, total: 0 };
            const eraPct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
            const color = ERA_COLORS[era.id] ?? '#22D3EE';
            return (
              <div key={era.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <dt style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-secondary)', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: color, flexShrink: 0 }} aria-hidden="true" />
                  {ERA_LABELS[era.id] ?? era.id}
                </dt>
                <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }} aria-hidden="true">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${eraPct}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} style={{ height: '100%', borderRadius: 99, background: color }} />
                </div>
                <dd style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-primary)', width: 36, textAlign: 'right', flexShrink: 0 }}>{d.correct}/{d.total}</dd>
              </div>
            );
          })}
        </dl>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={restart} className="btn-primary" style={{ fontSize: 15, padding: '8px 20px' }}>
            <RotateCcw size={13} aria-hidden="true" /> Try Again
          </button>
          <button onClick={share} className="btn-ghost" style={{ fontSize: 15 }} aria-label="Copy results to clipboard">
            {copied ? <Check size={13} aria-hidden="true" /> : <Share2 size={13} aria-hidden="true" />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Question screen ────────────────────────────────────────
  const isCorrect = answered !== null && answered === q.correctShuffledIndex;

  return (
    <div role="region" aria-label="Trivia Quiz" style={{ maxWidth: 580 }}>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>{current + 1} / {quiz.length}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--ui-primary)' }}>{results.filter(Boolean).length} correct</span>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.06)', marginBottom: 28, overflow: 'hidden' }} role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={quiz.length} aria-label="Quiz progress">
        <motion.div style={{ height: '100%', borderRadius: 99, background: 'var(--ui-primary)' }} animate={{ width: `${((current + 1) / quiz.length) * 100}%` }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={prefersReduced ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReduced ? undefined : { opacity: 0, x: -18 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ borderLeft: `2px solid ${eraColor}`, paddingLeft: 18 }}
        >
          {/* Era tag */}
          <span style={{ display: 'inline-block', marginBottom: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 4, border: `1px solid ${eraColor}40`, background: `${eraColor}12`, color: eraColor }}>
            {ERA_LABELS[q.original.eraId] ?? q.original.eraId}
          </span>

          {/* Question */}
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 19, color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.45 }}>
            {q.original.question}
          </p>

          {/* Answers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="group" aria-label="Answer options">
            {q.shuffledOptions.map((opt, idx) => {
              const chosen      = answered === idx;
              const showCorrect = answered !== null && idx === q.correctShuffledIndex;
              const showWrong   = chosen && !showCorrect;
              const dimmed      = answered !== null && !showCorrect && !chosen;

              // When unanswered, leave color/border/bg to the .quiz-opt class so :hover can tint it
              // (inline styles would otherwise outrank the hover rule, forcing !important).
              const stateStyle: React.CSSProperties = {};
              if (showCorrect) { stateStyle.border = '1px solid rgba(34,197,94,0.55)'; stateStyle.background = 'rgba(34,197,94,0.08)'; stateStyle.color = '#4ade80'; stateStyle.boxShadow = '0 0 18px rgba(34,197,94,0.18)'; }
              else if (showWrong) { stateStyle.border = '1px solid rgba(239,68,68,0.55)'; stateStyle.background = 'rgba(239,68,68,0.08)'; stateStyle.color = '#f87171'; }
              else if (dimmed) { stateStyle.border = '1px solid rgba(255,255,255,0.05)'; stateStyle.opacity = 0.45; }

              const animate = prefersReduced
                ? {}
                : showCorrect ? { scale: [1, 1.025, 1] }
                : showWrong   ? { x: [0, -5, 5, -3, 3, 0] }
                : {};

              return (
                <motion.button
                  key={idx}
                  onClick={() => choose(idx)}
                  disabled={answered !== null}
                  aria-label={`Option ${['A','B','C','D'][idx]}: ${opt}${answered !== null ? (showCorrect ? ' — correct' : chosen ? ' — incorrect' : '') : ''}`}
                  animate={animate}
                  transition={showCorrect ? { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0.4 }}
                  whileHover={answered === null && !prefersReduced ? { y: -1 } : {}}
                  className="quiz-opt"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, minHeight: 48,
                    padding: '10px 14px', borderRadius: 8,
                    fontFamily: "'Inter', sans-serif", fontSize: 16, textAlign: 'left',
                    cursor: answered !== null ? 'default' : 'pointer',
                    transition: 'border-color 180ms, background 180ms, color 180ms, opacity 180ms, box-shadow 180ms',
                    width: '100%',
                    ...stateStyle,
                  }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.1em', width: 20, flexShrink: 0, opacity: 0.5 }}>{['A','B','C','D'][idx]}</span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {showCorrect && <CheckCircle size={14} style={{ flexShrink: 0, color: '#4ade80' }} aria-hidden="true" />}
                  {showWrong   && <XCircle size={14}   style={{ flexShrink: 0, color: '#f87171' }} aria-hidden="true" />}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {answered !== null && (
              <motion.div
                initial={prefersReduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={prefersReduced ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <p aria-live="polite" style={{ marginTop: 14, padding: '12px 16px', borderRadius: 8, fontSize: 15, lineHeight: 1.6, border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, background: isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', color: isCorrect ? '#86efac' : '#fca5a5' }}>
                  <strong style={{ fontWeight: 600 }}>{isCorrect ? 'Correct. ' : 'Incorrect. '}</strong>
                  {q.original.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next */}
          {answered !== null && (
            <motion.div initial={prefersReduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }} style={{ marginTop: 18 }}>
              <button ref={nextBtnRef} onClick={next} className="btn-primary" style={{ fontSize: 15, padding: '9px 22px' }}>
                {current + 1 >= quiz.length ? 'See Results →' : 'Next →'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .quiz-opt { border: 1px solid var(--border-mid); background: transparent; color: var(--text-secondary); border-radius: 8px; }
        .quiz-opt:not(:disabled):hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.18); }
      `}</style>
    </div>
  );
}
