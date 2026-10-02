import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { useConsole } from '../store';
import { absTime, BOUNDARY_LABEL, firstAbsent, firstAbsentDirectory, humanize, relTime } from '../derive';
import { AttentionItem, BOUNDARY_ORDER, CONDITIONS, DIRECTORY_BOUNDARIES, FeedbackPoint } from '../model';
import { BoundaryChip, Chip, ChainStepper, cx, Disclosure, Field, Mono, ScopeChip, SEVERITY_META } from '../ui';

export const OrgLink: React.FC<{ id: string; className?: string }> = ({ id, className }) => {
  const { orgById, go } = useConsole();
  const o = orgById(id);
  return <button onClick={() => go(`/console/organisations/${id}`)} className={cx('font-semibold text-slate-900 hover:text-cyan-800 hover:underline text-left', className)}>{o?.name ?? 'Unknown Organisation'}</button>;
};

// Plain-language reading of where a chain stops. Facts only: no cause is asserted.
export function stopSentence(fp: FeedbackPoint, order: readonly string[] = DIRECTORY_BOUNDARIES): { tone: 'ok' | 'stop' | 'fail'; text: string; boundary: string | null } {
  const b = firstAbsent(fp.states, order as typeof BOUNDARY_ORDER);
  if (!b) return { tone: 'ok', text: `Complete through ${BOUNDARY_LABEL[order[order.length - 1] as keyof typeof BOUNDARY_LABEL]}`, boundary: null };
  const st = fp.states[b];
  const label = BOUNDARY_LABEL[b];
  if (st === 'failed') return { tone: 'fail', text: `Stops at ${label} — failed`, boundary: b };
  if (st === 'not_observed') return { tone: 'stop', text: `Stops at ${label} — not observed`, boundary: b };
  return { tone: 'stop', text: `Stops at ${label} — ${st.replace('_', ' ')}`, boundary: b };
}

export const StopBanner: React.FC<{ fp: FeedbackPoint; order?: readonly string[] }> = ({ fp, order }) => {
  const s = stopSentence(fp, order);
  return (
    <div className={cx('rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2 border',
      s.tone === 'ok' && 'bg-emerald-50 border-emerald-200 text-emerald-800', s.tone === 'stop' && 'bg-amber-50 border-amber-300 text-amber-900', s.tone === 'fail' && 'bg-rose-50 border-rose-300 text-rose-800')}>
      <span className={cx('w-2 h-2 rounded-full', s.tone === 'ok' && 'bg-emerald-500', s.tone === 'stop' && 'bg-amber-500', s.tone === 'fail' && 'bg-rose-500')} />
      {s.text}
    </div>
  );
};

export const FpChainRow: React.FC<{ fp: FeedbackPoint; showOrg?: boolean }> = ({ fp, showOrg }) => {
  const { go } = useConsole();
  const stop = firstAbsentDirectory(fp);
  return (
    <button onClick={() => go(`/console/feedback/${fp.id}`)} className="w-full text-left rounded-xl border border-slate-200 bg-white hover:border-cyan-500/60 p-3 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 truncate">{fp.name}</div>
          <div className="text-[10px] text-slate-500 truncate">{fp.location}{showOrg ? '' : ''}</div>
        </div>
        <StopMini fp={fp} />
      </div>
      <ChainStepper states={fp.states} order={BOUNDARY_ORDER} stoppedAt={stop} compact evaluatedThrough="evidence" />
    </button>
  );
};
export const StopMini: React.FC<{ fp: FeedbackPoint }> = ({ fp }) => {
  const s = stopSentence(fp);
  return <Chip tone={s.tone === 'ok' ? 'emerald' : s.tone === 'fail' ? 'rose' : 'amber'}>{s.tone === 'ok' ? 'Complete' : s.text.replace('Stops at ', '→ ').replace(' — ', ' · ')}</Chip>;
};

export const AttentionCard: React.FC<{ item: AttentionItem; showOrg?: boolean }> = ({ item, showOrg = true }) => {
  const { orgById, fps, can, go } = useConsole();
  const meta = CONDITIONS[item.condition];
  const sev = SEVERITY_META[meta.severity];
  const org = item.orgId ? orgById(item.orgId) : undefined;
  const fp = item.fpId ? fps.find((f) => f.id === item.fpId) : undefined;
  const held = can(item.action.permission);
  const canReadDomain = true;
  void canReadDomain;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Chip tone={sev.tone}>{sev.label}</Chip>
        <span className="text-xs font-bold text-slate-900">{meta.label}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          {showOrg && (
            <div className="text-xs text-slate-700 mb-1">
              {org ? <><OrgLink id={org.id} /> {fp && <span className="text-slate-400">· {fp.name}</span>}</> : <span className="font-semibold">Platform</span>}
            </div>
          )}
          <p className="text-xs text-slate-600 leading-relaxed">{item.stateDetail}</p>
          <p className="text-[10px] text-slate-400 mt-1">First observed {relTime(item.firstObserved)}</p>
        </div>
        <div className="shrink-0 flex flex-col items-start sm:items-end gap-1">
          <button onClick={() => go(item.action.route)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
            {item.action.label.replace('…', '')}<ArrowRight className="w-3.5 h-3.5" />
          </button>
          {item.action.permission.match(/admit|grant|publish|retire|suspend/) && !held && (
            <span className="text-[10px] text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" />You don’t hold <code className="font-mono">{item.action.permission.replace('platform.', '')}</code></span>
          )}
          <span className="text-[10px] text-slate-400">Opens the owning domain; the queue never runs a command.</span>
        </div>
      </div>
      <Disclosure label="Source fact, class and evidence">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Source fact">{meta.sourceFact}</Field>
          <Field label="Governed class">{sev.label}<span className="block text-[10px] text-slate-400 mt-0.5">{meta.basis}</span></Field>
          <Field label="First-observed basis">{item.firstObservedBasis}<span className="block text-[10px] text-slate-400">{absTime(item.firstObserved)}</span></Field>
          <Field label="Condition code"><Mono>{item.condition}</Mono></Field>
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center gap-2 mb-1.5"><span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Evidence payload</span><ScopeChip kind="organisation" name={org?.name} /></div>
          {org ? <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">{Object.entries(item.evidence).map(([k, v]) => <div key={k} className="text-[11px]"><dt className="inline text-slate-400">{humanize(k)}: </dt><dd className="inline text-slate-700 font-mono">{v}</dd></div>)}</dl>
            : <p className="text-[11px] text-slate-500">Platform items carry no evidence payload; it is returned only under an exact Organisation-target grant.</p>}
        </div>
      </Disclosure>
    </div>
  );
};

export { BoundaryChip };
