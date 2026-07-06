import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, GitCompare, Cpu } from 'lucide-react';

interface Processor {
  id: string;
  name: string;
  eraId: string;
  cores: number;
  coreConfig: string;
  clockSpeedGHz: number;
  dieSizeMm2: number;
  transistorCount: string;
  processNodeNm: number;
  notableFeature: string;
}

interface Era {
  id: string;
  name: string;
  period: string;
  order: number;
  notableFeature: string;
  description: string;
  accentColor: string;
}

interface Props {
  processors: Processor[];
  eras: Era[];
}

const ERA_COLORS: Record<string, string> = {
  'birth-of-mobile-cpus': '#22D3EE',
  'arm-revolution': '#34D399',
  'multicore-era': '#F59E0B',
  'system-on-chip-era': '#A78BFA',
  'ai-efficiency-era': '#F472B6',
};

// Rough compute proxy used for the "relative to latest" bar. Data-driven, not invented.
const computeScore = (p: Processor) => p.cores * p.clockSpeedGHz;

function SpecBar({ value, max, color }: { value: number; max: number; color: string }) {
  // Linear: bar width always equals value/max so it matches any % shown next to it.
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: 3 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{ height: '100%', borderRadius: 99, background: color, opacity: 0.8 }}
      />
    </div>
  );
}

// ↑ wins / ↓ loses indicator for compare mode
function WinArrow({ win, color }: { win: boolean | null; color: string }) {
  if (win === null) return null;
  return (
    <span
      role="img"
      style={{ fontSize: 13, marginLeft: 5, color: win ? color : 'var(--text-secondary)' }}
      aria-label={win ? 'better' : 'lower'}
    >
      {win ? '▲' : '▾'}
    </span>
  );
}

function SpecCard({
  proc,
  allProcessors,
  onClose,
  closeRef,
  color,
  compareWith,
}: {
  proc: Processor;
  allProcessors: Processor[];
  onClose: () => void;
  closeRef: React.Ref<HTMLButtonElement>;
  color: string;
  compareWith?: Processor | null;
}) {
  const prefersReduced = useReducedMotion();

  const maxClock = Math.max(...allProcessors.map(p => p.clockSpeedGHz));
  const maxDie   = Math.max(...allProcessors.map(p => p.dieSizeMm2));
  const maxScore = Math.max(...allProcessors.map(computeScore));

  // winner direction vs the other chip (null when not comparing)
  const winClock = compareWith ? proc.clockSpeedGHz >= compareWith.clockSpeedGHz : null;
  const winCores = compareWith ? proc.cores >= compareWith.cores : null;
  const winNode  = compareWith ? proc.processNodeNm <= compareWith.processNodeNm : null; // smaller = better

  const specs: Array<{ label: string; value: string; raw: number | null; max: number | null; win: boolean | null }> = [
    { label: 'Process Node', value: `${proc.processNodeNm} nm`, raw: null, max: null, win: winNode },
    { label: 'Transistors',  value: proc.transistorCount, raw: null, max: null, win: null },
    { label: 'Cores',        value: proc.coreConfig, raw: null, max: null, win: winCores },
    { label: 'Clock Speed',  value: `${proc.clockSpeedGHz} GHz`, raw: proc.clockSpeedGHz, max: maxClock, win: winClock },
    { label: 'Die Size',     value: `${proc.dieSizeMm2} mm²`, raw: proc.dieSizeMm2, max: maxDie, win: null },
  ];

  return (
    <motion.div
      role="dialog"
      aria-label={`${proc.name} specifications`}
      aria-modal="false"
      initial={prefersReduced ? false : { opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReduced ? undefined : { opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: `linear-gradient(to bottom, ${color}14, var(--bg-surface) 64px)`,
        border: `1px solid ${color}2e`,
        borderRadius: 12,
        padding: 18,
        position: 'relative',
        boxShadow: `0 0 0 1px ${color}14, 0 12px 40px rgba(0,0,0,0.55)`,
      }}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label={`Close ${proc.name} specifications`}
        style={{
          position: 'absolute', top: 10, right: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 24, height: 24, borderRadius: 4,
          border: '1px solid var(--border-mid)', background: 'transparent',
          color: 'var(--text-secondary)', cursor: 'pointer',
          transition: 'color 150ms, background 150ms',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <X size={12} aria-hidden="true" />
      </button>

      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color, marginBottom: 4 }}>
        {proc.eraId.replace(/-/g, ' ')}
      </p>

      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 14, paddingRight: 24, lineHeight: 1.2 }}>
        {proc.name}
      </h3>

      <dl style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {specs.map(({ label, value, raw, max, win }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <dt style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                {label}
              </dt>
              <dd style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                {value}
                <WinArrow win={win} color={color} />
              </dd>
            </div>
            {raw !== null && max !== null && <SpecBar value={raw} max={max} color={color} />}
          </div>
        ))}

        {/* Relative to latest processor, linear scale */}
        <div style={{ marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <dt style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Relative to Latest (2025)
            </dt>
            <dd style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color }}>
              {((computeScore(proc) / Math.max(...allProcessors.map(computeScore))) * 100).toFixed(1)}%
            </dd>
          </div>
          <SpecBar value={computeScore(proc)} max={maxScore} color={color} />
        </div>
      </dl>

      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
        {proc.notableFeature}
      </p>
    </motion.div>
  );
}

export default function TimelineExplorer({ processors, eras }: Props) {
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [openProcessors, setOpenProcessors] = useState<string[]>([]);

  const nodeRefs  = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const filteredProcessors = selectedEra ? processors.filter(p => p.eraId === selectedEra) : processors;
  const byEra = eras
    .map(era => ({ era, procs: filteredProcessors.filter(p => p.eraId === era.id) }))
    .filter(g => g.procs.length > 0);

  const toggleProcessor = useCallback((id: string) => {
    setOpenProcessors(prev => {
      if (prev.includes(id)) {
        setTimeout(() => nodeRefs.current[id]?.focus(), 50);
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 2) return [prev[1], id];
      setTimeout(() => closeRefs.current[id]?.focus(), 500);
      return [...prev, id];
    });
  }, []);

  const isOpen = (id: string) => openProcessors.includes(id);

  const filterBtnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '5px 12px', borderRadius: 4,
    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
    letterSpacing: '0.15em', textTransform: 'uppercase',
    cursor: 'pointer', border: '1px solid', transition: 'all 150ms',
  };

  return (
    <div role="region" aria-label="Timeline Explorer">

      {/* Era filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }} role="group" aria-label="Filter by era">
        <button
          onClick={() => setSelectedEra(null)}
          aria-pressed={selectedEra === null}
          style={{
            ...filterBtnBase,
            background: selectedEra === null ? 'var(--ui-primary)' : 'transparent',
            borderColor: selectedEra === null ? 'var(--ui-primary)' : 'var(--border-mid)',
            color: selectedEra === null ? '#05050A' : 'var(--text-secondary)',
          }}
        >
          All
        </button>
        {eras.map(era => {
          const active = selectedEra === era.id;
          const color = ERA_COLORS[era.id] ?? '#22D3EE';
          return (
            <button
              key={era.id}
              onClick={() => setSelectedEra(prev => prev === era.id ? null : era.id)}
              aria-pressed={active}
              aria-label={`Filter by ${era.name}`}
              title={era.name}
              style={{
                ...filterBtnBase,
                background: active ? color : 'transparent',
                borderColor: active ? color : 'var(--border-mid)',
                color: active ? '#05050A' : 'var(--text-secondary)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 99, background: active ? '#05050A' : color, flex: 'none' }} aria-hidden="true" />
              Era {era.order}
            </button>
          );
        })}
      </div>

      {/* Compare hint */}
      {openProcessors.length === 1 && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }} aria-live="polite">
          <GitCompare size={12} aria-hidden="true" />
          Click a second processor to compare side-by-side
        </p>
      )}

      {/* Compare view */}
      <AnimatePresence>
        {openProcessors.length === 2 && (() => {
          const a = processors.find(p => p.id === openProcessors[0])!;
          const b = processors.find(p => p.id === openProcessors[1])!;
          const ca = ERA_COLORS[a.eraId] ?? '#22D3EE';
          const cb = ERA_COLORS[b.eraId] ?? '#22D3EE';
          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: 32 }}
              aria-live="polite"
              aria-label="Comparison view"
            >
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12 }}>
                <GitCompare size={11} aria-hidden="true" /> Comparing
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, alignItems: 'stretch' }} className="cmp-grid">
                <SpecCard proc={a} allProcessors={processors} onClose={() => toggleProcessor(a.id)} closeRef={el => { closeRefs.current[a.id] = el; }} color={ca} compareWith={b} />
                {/* VS divider */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 14px' }} aria-hidden="true">
                  <div style={{ width: 1, flex: 1, background: `linear-gradient(to bottom, ${ca}, transparent)` }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.1em', background: `linear-gradient(135deg, ${ca}, ${cb})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', padding: '8px 0' }}>VS</span>
                  <div style={{ width: 1, flex: 1, background: `linear-gradient(to top, ${cb}, transparent)` }} />
                </div>
                <SpecCard proc={b} allProcessors={processors} onClose={() => toggleProcessor(b.id)} closeRef={el => { closeRefs.current[b.id] = el; }} color={cb} compareWith={a} />
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Timeline rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {byEra.map(({ era, procs }) => {
          const color = ERA_COLORS[era.id] ?? '#22D3EE';
          return (
            <div key={era.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.1em', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {era.period}
                </span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${color}30, rgba(255,255,255,0.04))` }} aria-hidden="true" />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                  {era.name}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, flexWrap: 'wrap' }}>
                {procs.map(proc => {
                  const active = isOpen(proc.id);
                  return (
                    <div key={proc.id} id={proc.id} style={{ flexShrink: 0 }}>
                      <button
                        ref={el => { nodeRefs.current[proc.id] = el; }}
                        onClick={() => toggleProcessor(proc.id)}
                        aria-expanded={active}
                        aria-label={`${proc.name}: ${proc.cores} core${proc.cores > 1 ? 's' : ''}, ${proc.clockSpeedGHz} GHz. ${active ? 'Close' : 'View'} specs.`}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          padding: '10px 10px 8px', borderRadius: 10,
                          border: `1px solid ${active ? color + '60' : 'var(--border-subtle)'}`,
                          background: active ? `${color}0d` : 'var(--bg-surface)',
                          cursor: 'pointer', width: 96, textAlign: 'center',
                          transition: 'border-color 200ms, background 200ms, box-shadow 200ms, transform 200ms',
                          boxShadow: active ? `0 0 0 1px ${color}25, 0 0 22px ${color}30, 0 6px 18px rgba(0,0,0,0.45)` : 'none',
                          transform: active ? 'scale(1.05)' : 'none',
                        }}
                      >
                        <div style={{ position: 'relative', width: 32, height: 32 }}>
                          {active && (
                            <motion.div
                              animate={{ scale: [1, 1.5], opacity: [0.45, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                              style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${color}` }}
                            />
                          )}
                          <div
                            style={{
                              position: 'absolute', inset: 0, borderRadius: '50%',
                              border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.14)'}`,
                              background: active ? `${color}1f` : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'border-color 200ms, background 200ms',
                            }}
                            aria-hidden="true"
                          >
                            <Cpu size={11} style={{ color: active ? color : 'rgba(255,255,255,0.28)' }} />
                          </div>
                        </div>

                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.3, color: active ? color : 'var(--text-secondary)', transition: 'color 200ms', wordBreak: 'break-word' }}>
                          {proc.name}
                        </span>

                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                          {proc.processNodeNm}nm / {proc.clockSpeedGHz}GHz
                        </span>
                      </button>

                      <AnimatePresence>
                        {active && openProcessors.length === 1 && (
                          <div style={{ marginTop: 8, width: 264, maxWidth: '90vw' }}>
                            <SpecCard proc={proc} allProcessors={processors} onClose={() => toggleProcessor(proc.id)} closeRef={el => { closeRefs.current[proc.id] = el; }} color={color} />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProcessors.length === 0 && (
        <p style={{ textAlign: 'center', padding: '64px 0', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: 'var(--text-secondary)' }}>
          No processors match this filter.
        </p>
      )}

      <style>{`
        @media (max-width: 640px) {
          .cmp-grid { grid-template-columns: 1fr !important; }
          .cmp-grid > div[aria-hidden="true"] { flex-direction: row !important; padding: 10px 0 !important; }
          .cmp-grid > div[aria-hidden="true"] > div { width: auto !important; height: 1px !important; flex: 1 !important; }
        }
      `}</style>
    </div>
  );
}
