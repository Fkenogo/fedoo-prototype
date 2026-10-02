import React, { useMemo, useState } from 'react';
import { ArrowRight, QrCode } from 'lucide-react';
import { useConsole } from '../store';
import { absTime, BOUNDARY_LABEL, firstAbsent, firstAbsentDirectory, humanize, relTime, shortId } from '../derive';
import { BOUNDARY_ORDER, DIRECTORY_BOUNDARIES, FeedbackPoint } from '../model';
import {
  BoundaryChip, Card, CardHeader, ChainStepper, Chip, cx, CuChip, Disclosure, EmptyState, Eyebrow, Field, Mono, Notice, PageHeader,
  ScopeChip, SearchBox, Select, AdmissionChip, LifecycleChip, HealthChip,
} from '../ui';
import { OrgLink, StopBanner } from './shared';

const FP_LIFECYCLE_TONE = { available: 'emerald', unavailable: 'amber', establishing: 'sky', retired: 'slate' } as const;
const ConfigChip: React.FC<{ fp: FeedbackPoint }> = ({ fp }) =>
  fp.configReadiness === 'ready' ? <Chip tone="emerald">Configuration ready</Chip>
  : fp.configReadiness === 'not_ready' ? <Chip tone="rose">Configuration not usable</Chip> : <Chip tone="slate">No effective configuration</Chip>;

const Stat: React.FC<{ label: string; value: React.ReactNode; sub?: string }> = ({ label, value, sub }) => (
  <div className="min-w-0"><Eyebrow>{label}</Eyebrow><div className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{value}</div>{sub && <div className="text-[10px] text-slate-400">{sub}</div>}</div>
);

const FpCard: React.FC<{ fp: FeedbackPoint }> = ({ fp }) => {
  const { orgById, go } = useConsole();
  const o = orgById(fp.orgId);
  const stop = firstAbsentDirectory(fp);
  return (
    <li className="rounded-2xl border border-slate-200 bg-white hover:border-cyan-500/50 hover:shadow-sm transition-all p-4 flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button onClick={() => go(`/console/feedback/${fp.id}`)} className="text-left"><div className="text-sm font-bold text-slate-900 hover:text-cyan-800 hover:underline underline-offset-2">{fp.name}</div></button>
          <div className="text-[11px] text-slate-500 mt-0.5"><OrgLink id={fp.orgId} className="text-[11px]" /> <span className="text-slate-300">·</span> {fp.location}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Chip tone={FP_LIFECYCLE_TONE[fp.lifecycle]}>{fp.lifecycle}</Chip>
          <ConfigChip fp={fp} />
        </div>
      </div>
      <StopBanner fp={fp} order={DIRECTORY_BOUNDARIES} />
      <ChainStepper states={fp.states} order={BOUNDARY_ORDER} stoppedAt={stop} evaluatedThrough="evidence" />
      <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
        <Stat label="Last Session" value={relTime(fp.last.session)} />
        <Stat label="Last Submission" value={relTime(fp.last.submission)} />
        <Stat label="Last Acceptance" value={relTime(fp.last.acceptance)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Activity · 7 days" value={`${fp.window.sessions} sessions`} sub={`${fp.window.submissions} submissions`} />
        <Stat label="Evidence" value={<BoundaryChip state={fp.states.evidence} />} sub={`${fp.evidenceCount} items recorded`} />
        <Stat label="Result · Signal" value={<span className="text-slate-400 font-normal">in detail</span>} sub="calculation-on-read" />
      </div>
      <Disclosure label="Technical details">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Feedback Point id"><Mono>{fp.id}</Mono></Field>
          <Field label="Public reference"><Mono>{fp.publicRef}</Mono></Field>
          <Field label="Configuration">{fp.configId ? <><Mono>{fp.configId}</Mono> <span className="text-slate-400">v{fp.configVersion}</span></> : 'none'}</Field>
          <Field label="Organisation id"><Mono>{shortId(o?.id ?? '')}</Mono></Field>
          <Field label="Created">{absTime(fp.createdAt)}</Field>
          <Field label="Last Evidence">{absTime(fp.last.evidence)}</Field>
        </div>
      </Disclosure>
      <button onClick={() => go(`/console/feedback/${fp.id}`)} className="text-[11px] font-semibold text-cyan-800 flex items-center gap-1 self-start">Open diagnostic<ArrowRight className="w-3 h-3" /></button>
    </li>
  );
};

export const FeedbackOpsView: React.FC = () => {
  const { fps, orgs } = useConsole();
  const [q, setQ] = useState('');
  const [life, setLife] = useState('all');
  const [stop, setStop] = useState('all');
  const [org, setOrg] = useState('all');
  const [sort, setSort] = useState('problems');
  const t = q.trim().toLowerCase();
  const stopOf = (f: FeedbackPoint) => firstAbsentDirectory(f) ?? 'complete';
  const rows = useMemo(() => fps.filter((f) =>
    (!t || `${f.name} ${f.publicRef} ${f.id} ${orgs.find((o) => o.id === f.orgId)?.name}`.toLowerCase().includes(t)) &&
    (life === 'all' || f.lifecycle === life) && (stop === 'all' || stopOf(f) === stop) && (org === 'all' || f.orgId === org)
  ).sort((a, b) => sort === 'problems' ? Number(stopOf(a) === 'complete') - Number(stopOf(b) === 'complete') || (orgs.find((o) => o.id === a.orgId)?.name ?? '').localeCompare(orgs.find((o) => o.id === b.orgId)?.name ?? '')
    : (orgs.find((o) => o.id === a.orgId)?.name ?? '').localeCompare(orgs.find((o) => o.id === b.orgId)?.name ?? '')), [fps, orgs, t, life, stop, org, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const hist = DIRECTORY_BOUNDARIES.map((b) => ({ b, n: fps.filter((f) => stopOf(f) === b).length }));
  const complete = fps.filter((f) => stopOf(f) === 'complete').length;
  const maxN = Math.max(1, complete, ...hist.map((h) => h.n));
  return (
    <>
      <PageHeader title="Feedback Operations" scope={<ScopeChip kind="platform" />}
        subtitle="Each Feedback Point is read as a chain: link → Feedback Point → configuration → session → submission → acceptance → Evidence. The first link not proved passed is where the chain stops. No Evidence content is ever shown." />
      <Card className="mb-4">
        <CardHeader title="Where chains stop" hint={`${fps.length} Feedback Points evaluated · window 168 h · request telemetry unavailable`} right={<Chip tone="slate">Result and Signal are evaluated in the detail</Chip>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-2">
          {[...hist.filter((h) => h.n > 0 || ['session', 'acceptance'].includes(h.b)), { b: 'complete' as const, n: complete }].map((h) => (
            <button key={h.b} onClick={() => setStop(stop === h.b ? 'all' : h.b)} className={cx('text-left rounded-xl px-2.5 py-2 border', stop === h.b ? 'border-cyan-500 bg-cyan-50/50' : 'border-transparent hover:bg-slate-50')}>
              <div className="flex justify-between text-[11px]"><span className="font-semibold text-slate-700">{h.b === 'complete' ? 'Complete through Evidence' : `Stops at ${BOUNDARY_LABEL[h.b]}`}</span><span className="tabular-nums font-bold text-slate-900">{h.n}</span></div>
              <div className="h-1.5 rounded-full bg-slate-100 mt-1.5 overflow-hidden"><div className={cx('h-full rounded-full', h.b === 'complete' ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${(h.n / maxN) * 100}%` }} /></div>
            </button>
          ))}
        </div>
      </Card>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search Organisation, Feedback Point, public reference or id" className="lg:flex-1" />
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Select label="Organisation" value={org} onChange={setOrg} options={[{ id: 'all', label: 'All' }, ...orgs.map((o) => ({ id: o.id, label: o.name }))]} />
          <Select label="Lifecycle" value={life} onChange={setLife} options={[{ id: 'all', label: 'All' }, ...['available', 'unavailable', 'establishing', 'retired'].map((x) => ({ id: x, label: x }))]} />
          <Select label="Chain" value={stop} onChange={setStop} options={[{ id: 'all', label: 'All' }, { id: 'complete', label: 'Complete through Evidence' }, ...DIRECTORY_BOUNDARIES.map((b) => ({ id: b, label: `Stops at ${BOUNDARY_LABEL[b]}` }))]} />
          <Select label="Sort" value={sort} onChange={setSort} options={[{ id: 'problems', label: 'Stopped chains first' }, { id: 'org', label: 'Organisation' }]} />
        </div>
      </div>
      <div className="text-[11px] text-slate-500 mb-2 px-1">{rows.length} of {fps.length} Feedback Points</div>
      {rows.length ? <ul className="grid grid-cols-1 xl:grid-cols-2 gap-3">{rows.map((f) => <FpCard key={f.id} fp={f} />)}</ul> : <EmptyState icon={<QrCode className="w-4 h-4" />} title="No Feedback Point matches" />}
    </>
  );
};

// ---------------------------------------------------------------------------
// Detail: the Organisation-target diagnostic
// ---------------------------------------------------------------------------
const BOUNDARY_MEANING: Record<string, string> = {
  public_ref: 'The public link resolves to exactly this Feedback Point by Product Truth.',
  endpoint: 'The Feedback Point lifecycle is available.',
  configuration: 'An effective configuration exists and can be presented to a participant.',
  session: 'At least one participant Session was started in the window.',
  submission: 'At least one Submission was received in the window.',
  acceptance: 'A Submission was accepted by Product acceptance with a coherent lineage.',
  evidence: 'Evidence was recorded from an accepted Submission.',
  result: 'A Measure Result can be calculated from that Evidence.',
  signal: 'A Service Signal followed from a Result.',
};
const boundaryReason = (fp: FeedbackPoint, b: string): string | null => {
  const s = fp.states[b as keyof typeof fp.states];
  if (s === 'passed') return null;
  if (b === 'endpoint' && s === 'failed') return `Lifecycle is ${fp.lifecycle}.`;
  if (b === 'configuration' && fp.configReason) return `Configuration reason: ${humanize(fp.configReason)}.`;
  if (b === 'configuration' && s === 'not_observed') return 'No effective configuration exists.';
  if (b === 'acceptance' && fp.integrityFindings) return `Integrity finding: ${humanize(fp.integrityFindings[0])}.`;
  if (b === 'result' && fp.classification === 'analytical_readiness_gap') return 'Analytical readiness gap: some Measures have no governed calculation mapping. Not an operational failure.';
  if (b === 'result' && fp.classification === 'technical_failure') return `Unexpected exception (${fp.technicalFailure}). Message withheld.`;
  if (b === 'signal' && s === 'unknown') return 'Depends on the Result.';
  if (s === 'not_observed') return 'Nothing observed in the window. Absence is not proof that nothing happened.';
  return null;
};

export const FeedbackPointDetailView: React.FC<{ id: string }> = ({ id }) => {
  const { fps, orgById, go } = useConsole();
  const fp = fps.find((f) => f.id === id);
  if (!fp) return <EmptyState title="Feedback Point not found" body="Unknown or unreadable Feedback Points read as not found." />;
  const o = orgById(fp.orgId)!;
  const stop = firstAbsent(fp.states);
  const subs = Array.from({ length: Math.min(4, fp.window.submissions) }, (_, i) => ({ n: i, at: fp.last.submission ? new Date(new Date(fp.last.submission).getTime() - i * 5_400_000).toISOString() : '', accepted: fp.states.acceptance !== 'not_observed' || fp.id === 'fp-s2' ? fp.states.acceptance === 'passed' : false }));
  const readyMeasures = fp.measures.filter((m) => m.result === 'passed').length;
  return (
    <>
      <PageHeader back={{ label: 'Feedback Operations', onClick: () => go('/console/feedback') }} title={fp.name} scope={<ScopeChip kind="organisation" name={o.name} />}
        subtitle={<span className="flex flex-wrap items-center gap-x-2"><OrgLink id={o.id} className="text-xs" /><span className="text-slate-300">·</span>{fp.location}<span className="text-slate-300">·</span><span title={fp.id}><Mono>{shortId(fp.id)}</Mono></span></span>} />
      <div className="flex flex-wrap gap-1.5 mb-4"><Chip tone={FP_LIFECYCLE_TONE[fp.lifecycle]}>{fp.lifecycle}</Chip><ConfigChip fp={fp} />{fp.customQuestion && <Chip tone="violet">Organisation-authored question present</Chip>}</div>

      <Card className="mb-4">
        <CardHeader title="Where the chain stops" hint="Each link is judged on its own evidence. A later pass never overwrites an earlier gap." />
        <StopBanner fp={fp} />
        <div className="mt-4"><ChainStepper states={fp.states} order={BOUNDARY_ORDER} stoppedAt={stop} /></div>
        <ul className="mt-5 divide-y divide-slate-100">
          {BOUNDARY_ORDER.map((b) => {
            const reason = boundaryReason(fp, b);
            return (
              <li key={b} className={cx('py-2.5 flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4', b === stop && 'bg-amber-50/60 -mx-3 px-3 rounded-xl')}>
                <div className="sm:w-36 shrink-0 flex items-center gap-2"><span className="text-xs font-bold text-slate-900">{BOUNDARY_LABEL[b]}</span></div>
                <div className="sm:w-40 shrink-0"><BoundaryChip state={fp.states[b]} /></div>
                <div className="text-[11px] text-slate-500 leading-relaxed">{BOUNDARY_MEANING[b]}{reason && <span className="block text-slate-700 font-medium mt-0.5">{reason}</span>}</div>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Configuration and Measures" hint={fp.configId ? `Effective configuration v${fp.configVersion} · ${fp.measures.length} governed Measures` : 'No effective configuration'} />
            {fp.measures.length ? (
              <>
                <div className="text-[11px] text-slate-500 mb-2">{fp.states.result === 'not_observed' ? 'Results are not observed yet: no Evidence in the window.' : `${readyMeasures} of ${fp.measures.length} Measures can produce a Result.`}</div>
                <ul className="divide-y divide-slate-100">{fp.measures.map((m) => (
                  <li key={m.name} className="py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0"><div className="text-xs font-semibold text-slate-800">{m.name}</div>{m.reason && <div className="text-[10px] text-slate-500">{humanize(m.reason)}</div>}</div>
                    <HealthChip state={m.result === 'passed' ? 'healthy_observed' : m.result === 'failed' ? 'degraded_observed' : 'not_observed'} label={m.result === 'passed' ? 'Result derivable' : m.result === 'failed' ? 'Readiness gap' : 'Not observed'} />
                  </li>))}</ul>
              </>
            ) : <p className="text-xs text-slate-500">{fp.configReadiness === 'none' ? 'This Feedback Point has no effective configuration, so no Measures are evaluated.' : 'Measure Results could not be evaluated: the Result calculation raised an unexpected exception.'}</p>}
            {fp.classification === 'technical_failure' && <div className="mt-3"><Notice tone="warn" title="Technical failure of the owning calculation">Exception type <Mono>{fp.technicalFailure}</Mono>. This is a distinct, observable fact; the message is never shown.</Notice></div>}
          </Card>
          <Card>
            <CardHeader title="Recent activity" hint={`Window ${fp.window.hours} h · ${fp.window.sessions} sessions · ${fp.window.submissions} submissions · counts only, no content`} />
            {subs.length ? <ul className="divide-y divide-slate-100">{subs.map((s) => (
              <li key={s.n} className="py-2.5 flex items-center justify-between gap-3"><div><div className="text-xs font-semibold text-slate-800">Submission · {relTime(s.at)}</div><div className="text-[10px] text-slate-400">5 answered · 0 skipped{fp.customQuestion ? ' · custom answer present' : ''}</div></div>
                <BoundaryChip state={fp.id === 'fp-s2' ? 'not_observed' : fp.integrityFindings && s.n === 0 ? 'failed' : fp.states.acceptance} /></li>))}</ul>
              : <p className="text-xs text-slate-500">No Session or Submission was observed in the window.</p>}
          </Card>
          {fp.integrityFindings && (
            <Card tone="danger"><CardHeader title="Lineage integrity findings" hint="Surfaced verbatim. Nothing is repaired or inferred." />
              <ul className="space-y-1">{fp.integrityFindings.map((x) => <li key={x} className="text-xs text-rose-800"><Mono>{x}</Mono></li>)}</ul></Card>)}
        </div>
        <div className="space-y-4">
          <Card tone="muted">
            <CardHeader title="Organisation context" hint="Adjacent facts. None is asserted as a cause." />
            <div className="space-y-2.5"><div className="flex gap-1.5 flex-wrap"><AdmissionChip v={o.admission} /><LifecycleChip v={o.lifecycle} /><CuChip balance={o.commercial.balance} /></div>
              {o.commercial.balance <= 0 && stop === 'acceptance' && <p className="text-[11px] text-slate-600 leading-relaxed">The Organisation’s balance is 0 CU. Fedoo does not persist why an acceptance is rejected, so this is shown beside the chain, not as its cause.</p>}
              <button onClick={() => go(`/console/organisations/${o.id}`)} className="text-[11px] font-semibold text-cyan-800 flex items-center gap-1">Open Organisation<ArrowRight className="w-3 h-3" /></button></div>
          </Card>
          <Card>
            <CardHeader title="Public access" />
            <dl className="space-y-2.5"><Field label="Resolves by Product Truth">{fp.states.public_ref === 'passed' ? 'Yes' : 'No'}</Field><Field label="Feedback Point available">{fp.lifecycle === 'available' ? 'Yes' : 'No'}</Field><Field label="Request telemetry"><HealthChip state="unavailable" /></Field></dl>
          </Card>
          <Card>
            <CardHeader title="Technical details" />
            <div className="space-y-2.5"><Field label="Feedback Point id"><Mono>{fp.id}</Mono></Field><Field label="Public reference"><Mono>{fp.publicRef}</Mono></Field><Field label="Created">{absTime(fp.createdAt)}</Field>
              <Disclosure label="Configuration lineage" count={fp.composition.length}>{fp.composition.length ? <div className="flex flex-wrap gap-1">{fp.composition.map((c) => <Mono key={c}>{c}</Mono>)}</div> : <span className="text-[11px] text-slate-500">None</span>}</Disclosure>
              <Disclosure label="Latest timestamps"><div className="space-y-1.5"><Field label="Session">{absTime(fp.last.session)}</Field><Field label="Submission">{absTime(fp.last.submission)}</Field><Field label="Acceptance">{absTime(fp.last.acceptance)}</Field><Field label="Evidence">{absTime(fp.last.evidence)}</Field><Field label="Signal">{absTime(fp.last.signal)}</Field></div></Disclosure></div>
          </Card>
          <Notice tone="neutral">Evidence content, participant answers and comments are never returned to the Operator Console.</Notice>
        </div>
      </div>
    </>
  );
};
