import React, { useMemo, useState } from 'react';
import { ArrowRight, Building2, Check, ChevronRight, Clock, Lock, MapPin, ShieldCheck } from 'lucide-react';
import { useConsole } from '../store';
import {
  absTime, attentionOf, eligibility, feedbackPointFacts, firstAbsentDirectory, fpsOf, hasManualGrant, humanize, isComplimentaryOnly, nextAction, relTime, rollup, shortId,
} from '../derive';
import { AuditEvent, CONDITIONS, Organisation } from '../model';
import {
  AcceptanceBlockedChip, AdmissionChip, Btn, Card, CardHeader, Chip, CommandDialog, CommandSpec, ComplimentaryChip, cx, CuChip, Disclosure, EmptyState, Eyebrow, Field,
  GatedAction, HealthChip, LifecycleChip, Mono, Notice, NotAuthorised, OperatorGrantedChip, PageHeader, ScopeChip, SearchBox, Select, SetupChip, Tabs, TierChip,
} from '../ui';
import { AttentionCard, FpChainRow, OrgLink } from './shared';
import { HealthPanel } from './Health';

const orgHealth = (o: Organisation, fps: ReturnType<typeof useConsole>['fps']) => {
  const f = fpsOf(o.id, fps);
  if (o.lifecycle === 'closed') return { state: 'not_applicable' as const, note: 'Closed Organisation: no product-path health applies' };
  if (!f.length) return { state: 'not_observed' as const, note: 'No Feedback Points yet' };
  const facts = f.flatMap(feedbackPointFacts);
  const state = rollup(facts.map((x) => x.state));
  const stopped = f.filter((x) => firstAbsentDirectory(x) !== null).length;
  return { state, note: stopped ? `${stopped} of ${f.length} Feedback Points stop before Evidence` : `All ${f.length} complete through Evidence` };
};

// ---------------------------------------------------------------------------
// Directory
// ---------------------------------------------------------------------------
const OrgRow: React.FC<{ o: Organisation }> = ({ o }) => {
  const { fps, attention, go, can } = useConsole();
  const f = fpsOf(o.id, fps);
  const att = attentionOf(o.id, attention);
  const h = orgHealth(o, fps);
  const next = nextAction(o, attention);
  const stopped = f.filter((x) => firstAbsentDirectory(x) !== null).length;
  const commercialVisible = can('platform.commercial.account.read');
  return (
    <li className="rounded-2xl border border-slate-200 bg-white hover:border-cyan-500/50 hover:shadow-sm transition-all">
      <div className="p-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] gap-x-5 gap-y-3 items-start">
        <div className="min-w-0">
          <button onClick={() => go(`/console/organisations/${o.id}`)} className="text-left group">
            <div className="text-sm font-bold text-slate-900 group-hover:text-cyan-800 group-hover:underline underline-offset-2">{o.name}</div>
          </button>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap"><MapPin className="w-3 h-3" />{o.city}, {o.country}<span className="text-slate-300">·</span>{o.sector}</div>
          <div className="mt-1.5"><span title={o.id}><Mono>{shortId(o.id)}</Mono></span></div>
        </div>
        <div>
          <Eyebrow>Admission · lifecycle</Eyebrow>
          <div className="flex flex-wrap gap-1 mt-1.5"><AdmissionChip v={o.admission} /><LifecycleChip v={o.lifecycle} /><SetupChip v={o.setup.state} /></div>
        </div>
        <div>
          <Eyebrow>Commercial</Eyebrow>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {commercialVisible ? (
              <>
                <TierChip v={o.commercial.tier} /><CuChip balance={o.commercial.balance} />
                {o.commercial.balance <= 0
                  ? <AcceptanceBlockedChip />
                  : isComplimentaryOnly(o)
                    ? <ComplimentaryChip />
                    : <OperatorGrantedChip />}
              </>
            ) : <Chip tone="slate" icon={<Lock className="w-3 h-3" />}>Not authorised</Chip>}
          </div>
          {commercialVisible && o.commercial.balance <= 0 && (
            <div className="text-[10px] text-rose-700 font-semibold mt-1">0 CU — acceptance blocked · admitted & operational unchanged</div>
          )}
          {commercialVisible && isComplimentaryOnly(o) && o.commercial.balance > 0 && (
            <div className="text-[10px] text-slate-400 mt-1">100 CU initial grant · one-time complimentary</div>
          )}
        </div>
        <div>
          <Eyebrow>Feedback Points</Eyebrow>
          <div className="mt-1.5 text-xs text-slate-800 font-semibold tabular-nums">{f.length}
            {stopped > 0 && <span className="ml-1.5 text-[10px] font-bold text-amber-700">{stopped} stopped</span>}</div>
          <div className="text-[10px] text-slate-400">{o.locations.length} Location{o.locations.length === 1 ? '' : 's'} · {o.members.active} active users</div>
        </div>
        <div>
          <Eyebrow>Health · attention</Eyebrow>
          <div className="flex flex-wrap gap-1 mt-1.5 items-center" title={h.note}>
            <HealthChip state={h.state} />
            {att.length > 0 && <Chip tone="amber">{att.length} need attention</Chip>}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between gap-3 bg-slate-50/60 rounded-b-2xl">
        {next ? (
          <button onClick={() => next.route && go(next.route)} className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 hover:text-cyan-800">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Next</span>{next.label}<ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : <span className="text-[11px] text-slate-400">No next action named by any implemented source</span>}
        <button onClick={() => go(`/console/organisations/${o.id}`)} className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center">Open<ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
    </li>
  );
};

export const OrganisationsView: React.FC = () => {
  const { orgs, attention, route, go, fps } = useConsole();
  const [q, setQ] = useState(route.query.get('q') ?? '');
  const [admission, setAdmission] = useState(route.query.get('admission') ?? 'all');
  const [lifecycle, setLifecycle] = useState('all');
  const [attn, setAttn] = useState('all');
  const [commercial, setCommercial] = useState('all');
  const t = q.trim().toLowerCase();
  const rows = useMemo(() => orgs.filter((o) =>
    (!t || `${o.name} ${o.id} ${o.city} ${o.sector}`.toLowerCase().includes(t)) &&
    (admission === 'all' || o.admission === admission) && (lifecycle === 'all' || o.lifecycle === lifecycle) &&
    (attn === 'all' || (attn === 'yes') === (attentionOf(o.id, attention).length > 0)) &&
    (commercial === 'all' || (commercial === 'zero' ? o.commercial.balance <= 0
      : commercial === 'complimentary' ? isComplimentaryOnly(o) && o.commercial.balance > 0
      : commercial === 'granted' ? hasManualGrant(o)
      : commercial === 'has' ? o.commercial.balance > 0 : o.commercial.tier === commercial))
  ).sort((a, b) => (a.admission === 'pending' ? 0 : 1) - (b.admission === 'pending' ? 0 : 1) || b.establishedAt.localeCompare(a.establishedAt)), [orgs, t, admission, lifecycle, attn, commercial, attention]);
  const counts = {
    pending: orgs.filter((o) => o.admission === 'pending').length,
    zero: orgs.filter((o) => o.commercial.balance <= 0 && o.admission === 'admitted' && o.lifecycle === 'operational').length,
    suspended: orgs.filter((o) => o.lifecycle === 'suspended').length,
    attn: orgs.filter((o) => attentionOf(o.id, attention).length > 0).length,
  };
  const tile = (label: string, n: number, on: () => void, tone: string) => (
    <button onClick={on} className="text-left rounded-2xl border border-slate-200 bg-white p-3.5 hover:border-cyan-500/60 transition-colors">
      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</div>
      <div className={cx('text-2xl font-bold tabular-nums mt-0.5', n ? tone : 'text-slate-300')}>{n}</div>
    </button>
  );
  void fps; void go;
  return (
    <>
      <PageHeader title="Organisations" scope={<ScopeChip kind="platform" />}
        subtitle="Every Organisation Fedoo has admitted or is waiting to admit. Pending admissions come first. Opening an Organisation moves you into an Organisation-target view." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {tile('Pending admission', counts.pending, () => { setAdmission('pending'); setLifecycle('all'); setAttn('all'); setCommercial('all'); }, 'text-amber-600')}
        {tile('At zero CU', counts.zero, () => { setCommercial('zero'); setAdmission('all'); setAttn('all'); }, 'text-rose-600')}
        {tile('Suspended', counts.suspended, () => { setLifecycle('suspended'); setAdmission('all'); setAttn('all'); setCommercial('all'); }, 'text-amber-600')}
        {tile('Need attention', counts.attn, () => { setAttn('yes'); setAdmission('all'); setLifecycle('all'); setCommercial('all'); }, 'text-slate-900')}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, city, sector or Organisation id" className="lg:flex-1" />
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Select label="Admission" value={admission} onChange={setAdmission} options={[{ id: 'all', label: 'All' }, { id: 'pending', label: 'Pending' }, { id: 'admitted', label: 'Admitted' }]} />
          <Select label="Lifecycle" value={lifecycle} onChange={setLifecycle} options={[{ id: 'all', label: 'All' }, { id: 'operational', label: 'Operational' }, { id: 'suspended', label: 'Suspended' }, { id: 'closed', label: 'Closed' }]} />
          <Select label="Attention" value={attn} onChange={setAttn} options={[{ id: 'all', label: 'All' }, { id: 'yes', label: 'Needs attention' }, { id: 'no', label: 'None' }]} />
          <Select label="Commercial" value={commercial} onChange={setCommercial} options={[{ id: 'all', label: 'All' }, { id: 'zero', label: 'Zero CU · blocked' }, { id: 'has', label: 'Has CU' }, { id: 'complimentary', label: 'Complimentary only' }, { id: 'granted', label: 'Operator-granted CU' }, { id: 'basic', label: 'Basic' }, { id: 'premium', label: 'Premium' }]} />
        </div>
      </div>
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-[11px] text-slate-500">{rows.length} of {orgs.length} Organisations</div>
        {(t || admission !== 'all' || lifecycle !== 'all' || attn !== 'all' || commercial !== 'all') && (
          <button className="text-[11px] font-semibold text-cyan-800" onClick={() => { setQ(''); setAdmission('all'); setLifecycle('all'); setAttn('all'); setCommercial('all'); }}>Clear filters</button>
        )}
      </div>
      {rows.length ? <ul className="space-y-3">{rows.map((o) => <OrgRow key={o.id} o={o} />)}</ul>
        : <EmptyState icon={<Building2 className="w-4 h-4" />} title="No Organisation matches these filters" body="Try clearing a filter. A name or id search never reaches Organisations you are not permitted to read." />}
      <p className="text-[10px] text-slate-400 mt-4">
        Health and CU are composed per Organisation under exact Organisation-target grants. “Not authorised” appears where the operator does not hold that grant.
        Admission, lifecycle and commercial capacity are separate: zero CU blocks new accepted feedback only — it never suspends, closes or un-admits an Organisation.
        No low/medium/high balance judgement exists and no low-balance threshold is governed. There is no Trial status.
      </p>
    </>
  );
};

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------
const ACTION_LABEL: Record<string, string> = {
  'platform.organisation.admission.admit': 'Admitted Organisation', 'platform.organisation.lifecycle.suspend': 'Suspended Organisation',
  'platform.organisation.lifecycle.reinstate': 'Reinstated Organisation', 'platform.organisation.lifecycle.close': 'Permanently closed Organisation',
  'platform.commercial.grant': 'Granted CU pack', 'platform.commercial.tier.change': 'Changed tier',
  'platform.support.context.enter': 'Entered support context', 'platform.support.context.exit': 'Exited support context',
};
export const Timeline: React.FC<{ events: AuditEvent[]; limit?: number }> = ({ events, limit }) => {
  const list = limit ? events.slice(0, limit) : events;
  if (!list.length) return <EmptyState title="No operator events yet" body="Nothing is inferred from absence: this Organisation simply has no recorded operator action." icon={<Clock className="w-4 h-4" />} />;
  return (
    <ol className="relative border-l border-slate-200 ml-2 space-y-4">
      {list.map((e, i) => (
        <li key={i} className="ml-4">
          <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-cyan-600 border-2 border-white" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-bold text-slate-900">{ACTION_LABEL[e.action] ?? humanize(e.action)}</span>
            {e.before && e.after && <span className="text-[11px] text-slate-500">{e.before} → {e.after}</span>}
            <span className="text-[10px] text-slate-400">{relTime(e.at)} · {absTime(e.at)}</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5">“{e.reason}”</div>
          <Disclosure label="Audit detail"><div className="grid sm:grid-cols-3 gap-3"><Field label="Action"><Mono>{e.action}</Mono></Field><Field label="Result">{e.result}</Field><Field label="Source"><Mono>{e.source}</Mono></Field></div></Disclosure>
        </li>
      ))}
    </ol>
  );
};

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------
const Tile: React.FC<{ label: string; children: React.ReactNode; sub?: React.ReactNode }> = ({ label, children, sub }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
    <Eyebrow>{label}</Eyebrow>
    <div className="mt-1.5">{children}</div>
    {sub && <div className="text-[10px] text-slate-400 mt-1.5 leading-snug">{sub}</div>}
  </div>
);

export const OrganisationDetailView: React.FC<{ id: string }> = ({ id }) => {
  const c = useConsole();
  const { orgById, route, go, can, fps, memberships, attention } = c;
  const o = orgById(id);
  const [spec, setSpec] = useState<CommandSpec | null>(null);
  if (!o) return <EmptyState title="Organisation not found" body="Unknown, foreign or unreadable Organisations read as not found." />;
  const tab = route.query.get('tab') ?? 'overview';
  const setTab = (t: string) => go(`/console/organisations/${id}?tab=${t}`);
  const f = fpsOf(o.id, fps);
  const att = attentionOf(o.id, attention);
  const people = memberships.filter((m) => m.orgId === o.id);
  const el = eligibility(o);
  const h = orgHealth(o, fps);
  const next = nextAction(o, attention);
  const canCommercial = can('platform.commercial.account.read') && can('platform.commercial.ledger.read');
  const pack = o.commercial.tier === 'basic' ? 100 : 50;
  const nextTier = o.commercial.tier === 'basic' ? 'premium' : 'basic';

  const open = (s: CommandSpec) => setSpec(s);
  const cmds = {
    admit: () => open({ title: 'Admit Organisation', verb: 'Admit Organisation', permission: 'platform.organisation.admission.admit', expected: 'Admission: pending', phrase: `ADMITTED ORGANISATION ${o.id}`,
      summary: <>Admit <strong>{o.name}</strong> so it can operate on Fedoo.</>, consequences: ['Records admission with provenance “operator”.', 'Does not grant CU, change tier or alter lifecycle.', 'The Needs Attention item for this Organisation disappears once the condition changes.'], onConfirm: (r) => c.admit(o.id, r) }),
    suspend: () => open({ title: 'Suspend Organisation', verb: 'Suspend Organisation', permission: 'platform.organisation.lifecycle.suspend', expected: 'Lifecycle: operational', phrase: `SUSPENDED ORGANISATION ${o.id}`,
      summary: <>Suspend <strong>{o.name}</strong>. Suspension is reversible by reinstatement.</>, consequences: ['Sets the operational lifecycle to suspended.', 'The Organisation stops being eligible (factual gate: not_operational).', 'Recorded in the append-only audit with your reason.'], onConfirm: (r) => c.setLifecycle(o.id, 'suspended', r) }),
    reinstate: () => open({ title: 'Reinstate Organisation', verb: 'Reinstate Organisation', permission: 'platform.organisation.lifecycle.reinstate', expected: 'Lifecycle: suspended', phrase: `OPERATIONAL ORGANISATION ${o.id}`,
      summary: <>Return <strong>{o.name}</strong> to operational.</>, consequences: ['Requires the Organisation to be admitted.', 'Recorded in the append-only audit with your reason.'], onConfirm: (r) => c.setLifecycle(o.id, 'operational', r) }),
    close: () => open({ title: 'Permanently close Organisation', verb: 'Permanently close', tone: 'danger', permission: 'platform.organisation.lifecycle.close', expected: `Lifecycle: ${o.lifecycle}`, phrase: `PERMANENTLY CLOSE ORGANISATION ${o.id}`,
      summary: <>Closing <strong>{o.name}</strong> is terminal. There is no reopen command.</>, consequences: ['Closed is a terminal lifecycle state.', 'Nothing is deleted; history and audit remain.'], onConfirm: (r) => c.setLifecycle(o.id, 'closed', r) }),
    grant: () => open({ title: `Grant ${pack} CU pack`, verb: 'Grant CU pack', permission: 'platform.commercial.grant', expected: `Tier: ${o.commercial.tier} · balance ${o.commercial.balance} CU`, phrase: `GRANT ${pack} CU TO ORGANISATION ${o.id}`,
      summary: (<><p>Grant the governed {pack} CU {o.commercial.tier === 'basic' ? 'Basic' : 'Premium'} pack to <strong>{o.name}</strong>.</p>
        <div className="grid grid-cols-3 gap-2 mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
          <div><div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current balance</div><div className="text-base font-bold tabular-nums">{o.commercial.balance} CU</div></div>
          <div><div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Grant pack</div><div className="text-base font-bold tabular-nums">+{pack} CU</div></div>
          <div><div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Balance after</div><div className="text-base font-bold tabular-nums text-emerald-700">{o.commercial.balance + pack} CU</div></div>
        </div>
        <p className="mt-3 font-semibold">Confirm commercial approval outside Fedoo before granting CU.</p></>),
      consequences: ['The pack size is fixed by tier; it cannot be edited here — there is no “set balance to X”.', 'Appends a ledger entry; the ledger is the balance authority.', 'Recorded in the append-only audit with your reason and the exact phrase.', 'Restores new-acceptance capacity; the Zero-CU Needs Attention item disappears once the balance is positive.'], onConfirm: (r) => c.grantPack(o.id, r) }),
    tier: () => open({ title: `Change tier to ${nextTier === 'premium' ? 'Premium' : 'Basic'}`, verb: 'Change tier', permission: 'platform.commercial.tier.change', expected: `Tier: ${o.commercial.tier}`, phrase: `CHANGE ORGANISATION ${o.id} TO ${nextTier.toUpperCase()}`,
      summary: <>Change <strong>{o.name}</strong> from {o.commercial.tier} to {nextTier}. Tier and CU are independent: this changes capability, not balance (still {o.commercial.balance} CU).</>, consequences: ['Changes governed Standard Question capability and support level.', 'Does not move CU and does not imply payment success — payment integration does not exist yet.', 'Recorded in the append-only audit with your reason.'], onConfirm: (r) => c.changeTier(o.id, r) }),
  };

  const lifecycleActions = (
    <div className="flex flex-wrap gap-2">
      {o.admission === 'pending' && <GatedAction held={can('platform.organisation.admission.admit')} permission="platform.organisation.admission.admit"><Btn variant="primary" onClick={cmds.admit}><Check className="w-3.5 h-3.5" />Admit…</Btn></GatedAction>}
      {o.lifecycle === 'operational' && <GatedAction held={can('platform.organisation.lifecycle.suspend')} permission="platform.organisation.lifecycle.suspend"><Btn onClick={cmds.suspend}>Suspend…</Btn></GatedAction>}
      {o.lifecycle === 'suspended' && <GatedAction held={can('platform.organisation.lifecycle.reinstate')} permission="platform.organisation.lifecycle.reinstate"><Btn onClick={cmds.reinstate}>Reinstate…</Btn></GatedAction>}
      {(o.lifecycle === 'operational' || o.lifecycle === 'suspended') && <GatedAction held={can('platform.organisation.lifecycle.close')} permission="platform.organisation.lifecycle.close"><Btn variant="danger" onClick={cmds.close}>Permanently close…</Btn></GatedAction>}
      {o.lifecycle === 'closed' && <span className="text-[11px] text-slate-500">Closed is terminal. No command is offered.</span>}
    </div>
  );

  return (
    <>
      <PageHeader back={{ label: 'Organisations', onClick: () => go('/console/organisations') }}
        title={o.name} scope={<ScopeChip kind="organisation" name={o.name} />}
        subtitle={<span className="flex flex-wrap items-center gap-x-2 gap-y-1"><span>{o.sector} · {o.city}, {o.country}</span><span className="text-slate-300">·</span><span title="Organisation id"><Mono>{o.id}</Mono></span></span>}
        actions={can('platform.support.context.enter') ? <Btn onClick={() => go('/console/support')}><ShieldCheck className="w-3.5 h-3.5" />Support context</Btn> : undefined} />
      <div className="flex flex-wrap gap-1.5 mb-4"><AdmissionChip v={o.admission} /><LifecycleChip v={o.lifecycle} /><SetupChip v={o.setup.state} />{canCommercial && <TierChip v={o.commercial.tier} />}</div>

      <Tabs active={tab} onChange={setTab} tabs={[
        { id: 'overview', label: 'Overview' }, { id: 'admission', label: 'Admission & lifecycle' }, { id: 'commercial', label: 'Commercial' },
        { id: 'feedback', label: `Feedback Points (${f.length})` }, { id: 'access', label: `Users & Access (${people.length})` },
        { id: 'health', label: 'Health' }, { id: 'attention', label: 'Needs Attention', badge: att.length }, { id: 'timeline', label: 'Timeline' },
      ]} />

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Tile label="A · Admission" sub={o.admittedAt ? `Admitted ${relTime(o.admittedAt)} · ${o.admissionProvenance}` : `Established ${relTime(o.establishedAt)} · ${o.admissionProvenance}`}><AdmissionChip v={o.admission} /></Tile>
            <Tile label="B · Operational lifecycle" sub={o.lifecycleNote ? `${o.lifecycle === 'closed' ? 'Closed' : 'Suspended'} ${relTime(o.lifecycleNote.at)}` : 'Single lifecycle authority'}><LifecycleChip v={o.lifecycle} /></Tile>
            <Tile label="C · Commercial" sub={canCommercial ? (o.commercial.balance <= 0 ? '0 CU — new accepted feedback blocked' : `${o.commercial.consumed} of ${o.commercial.granted} CU consumed · ${o.commercial.tier}`) : 'Needs platform.commercial.account.read'}>
              {canCommercial ? (
                <div className="flex gap-1 flex-wrap items-center">
                  <TierChip v={o.commercial.tier} /><CuChip balance={o.commercial.balance} />
                  {o.commercial.balance <= 0 ? <AcceptanceBlockedChip /> : isComplimentaryOnly(o) ? <ComplimentaryChip /> : <OperatorGrantedChip />}
                </div>
              ) : <Chip icon={<Lock className="w-3 h-3" />}>Not authorised</Chip>}</Tile>
            <Tile label="D · Feedback state" sub={(() => { const stopped = f.filter((x) => firstAbsentDirectory(x) !== null).length; return `${f.length} Feedback Points · ${stopped ? `${stopped} need attention` : 'all complete through Evidence'} · ${o.setup.state === 'complete' ? 'setup complete' : 'setup incomplete'}`; })()}>
              <div className="text-sm font-bold text-slate-900 tabular-nums">{f.length} <span className="text-[11px] font-semibold text-slate-500">Feedback Points</span></div>
            </Tile>
          </div>
          <Card tone={next ? 'default' : 'muted'}>
            <CardHeader title="Recommended next operator action" hint="Factual, from the implemented allowed actions only. Never invents a command." />
            {next ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-700"><strong className="text-slate-900">{next.label}</strong><span className="block text-[11px] text-slate-500 mt-0.5">Opens the owning domain; the command itself re-authorises on the server with reason and typed confirmation.</span></div>
                <Btn variant="primary" onClick={() => next.route && go(next.route)}>Open<ArrowRight className="w-3.5 h-3.5" /></Btn>
              </div>
            ) : <div className="text-xs text-slate-500">No operator action is currently named by any implemented source. {o.lifecycle === 'suspended' ? 'Suspension is shown factually; reinstatement is offered in Admission & lifecycle.' : o.lifecycle === 'closed' ? 'Closed is terminal.' : 'This is not a health claim.'}</div>}
          </Card>
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader title="What needs doing" hint="From the Needs Attention queue. Items disappear when their condition changes." right={att.length ? <Chip tone="amber">{att.length}</Chip> : undefined} />
              {att.length ? <div className="space-y-3">{att.map((a) => <AttentionCard key={a.id} item={a} showOrg={false} />)}</div>
                : <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">No implemented source currently reports a condition for this Organisation. {o.lifecycle === 'suspended' ? 'Suspension itself is not a queue item; it is shown factually here.' : 'This is not a health claim.'}</div>}
              {next && !att.length ? null : null}
            </Card>
            <Card>
              <CardHeader title="Health" hint={h.note} />
              <HealthChip state={h.state} />
              <button onClick={() => setTab('health')} className="mt-3 text-[11px] font-semibold text-cyan-800 flex items-center gap-1">Open health detail<ArrowRight className="w-3 h-3" /></button>
            </Card>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader title="Feedback Points" hint="Where each transaction chain currently stops." right={<button onClick={() => setTab('feedback')} className="text-[11px] font-semibold text-cyan-800">All</button>} />
              {f.length ? <div className="grid sm:grid-cols-2 gap-2.5">{f.slice(0, 4).map((x) => <FpChainRow key={x.id} fp={x} />)}</div> : <EmptyState title="No Feedback Points" />}
            </Card>
            <Card>
              <CardHeader title="Profile" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country">{o.country}</Field><Field label="Timezone">{o.timezone}</Field>
                <Field label="Sector">{o.sector}</Field><Field label="Admin language">{o.adminLanguage}</Field>
                <Field label="Feedback languages">{o.feedbackLanguages.join(', ')}</Field><Field label="Contact">{o.adminContact}</Field>
                <Field label="Established">{relTime(o.establishedAt)}</Field><Field label="Locations">{o.locations.map((l) => l.name).join(', ')}</Field>
              </div>
            </Card>
          </div>
          <Card>
            <CardHeader title="Operator actions" hint="Only commands the production Product Truth currently owns. Availability follows the Organisation's own admission, lifecycle and permission state." />
            <div className="flex flex-wrap gap-2">
              {o.admission === 'pending'
                ? <GatedAction held={can('platform.organisation.admission.admit')} permission="platform.organisation.admission.admit"><Btn variant="primary" onClick={cmds.admit}><Check className="w-3.5 h-3.5" />Admit Organisation…</Btn></GatedAction>
                : <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">Admitted — no admission command applies</span>}
              {canCommercial
                ? <><GatedAction held={can('platform.commercial.grant')} permission="platform.commercial.grant"><Btn variant="primary" onClick={cmds.grant}>Grant {pack} CU pack…</Btn></GatedAction>
                  <GatedAction held={can('platform.commercial.tier.change')} permission="platform.commercial.tier.change"><Btn onClick={cmds.tier}>Change tier to {nextTier}…</Btn></GatedAction></>
                : <span className="text-[11px] text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-xl px-3 py-2">Commercial commands need platform.commercial grants</span>}
              {o.lifecycle === 'operational' && <GatedAction held={can('platform.organisation.lifecycle.suspend')} permission="platform.organisation.lifecycle.suspend"><Btn onClick={cmds.suspend}>Suspend…</Btn></GatedAction>}
              {o.lifecycle === 'suspended' && <GatedAction held={can('platform.organisation.lifecycle.reinstate')} permission="platform.organisation.lifecycle.reinstate"><Btn onClick={cmds.reinstate}>Reinstate…</Btn></GatedAction>}
              {(o.lifecycle === 'operational' || o.lifecycle === 'suspended') && <GatedAction held={can('platform.organisation.lifecycle.close')} permission="platform.organisation.lifecycle.close"><Btn variant="danger" onClick={cmds.close}>Permanently close…</Btn></GatedAction>}
              {o.lifecycle === 'closed' && <span className="text-[11px] text-slate-500">Closed is terminal. No command is offered.</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Suspend / reinstate / close are lifecycle decisions. Granting CU and changing tier are commercial decisions. Zero CU never suspends or closes. No Reject, Start trial, Extend trial, Mark paid, Cancel subscription or Refund command exists.</p>
          </Card>
          <Card><CardHeader title="Recent operator activity" right={<button onClick={() => setTab('timeline')} className="text-[11px] font-semibold text-cyan-800">Full timeline</button>} /><Timeline events={o.timeline} limit={3} /></Card>
        </div>
      )}

      {tab === 'admission' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Admission" hint="Separate from lifecycle. Admission is a one-way operator decision." />
            <div className="flex items-center gap-2 mb-4">
              {(['established', 'pending', 'admitted'] as const).map((s, i) => {
                const reached = s === 'established' || (s === 'pending' && true) || (s === 'admitted' && o.admission === 'admitted');
                const current = (s === 'pending' && o.admission === 'pending') || (s === 'admitted' && o.admission === 'admitted');
                return <React.Fragment key={s}>{i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}<span className={cx('text-[11px] font-bold px-2.5 py-1 rounded-full border', current ? 'bg-slate-900 text-white border-slate-900' : reached ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'text-slate-400 border-dashed border-slate-300')}>{s}</span></React.Fragment>;
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State"><AdmissionChip v={o.admission} /></Field><Field label="Provenance">{o.admissionProvenance}</Field>
              <Field label="Established">{absTime(o.establishedAt)}</Field><Field label="Admitted">{o.admittedAt ? absTime(o.admittedAt) : 'Not yet'}</Field>
            </div>
            <div className="mt-4">{o.admission === 'pending' ? <GatedAction held={can('platform.organisation.admission.admit')} permission="platform.organisation.admission.admit"><Btn variant="primary" onClick={cmds.admit}><Check className="w-3.5 h-3.5" />Admit Organisation…</Btn></GatedAction> : <span className="text-[11px] text-slate-500">Admission is complete.</span>}</div>
          </Card>
          <Card>
            <CardHeader title="Operational lifecycle" hint="The single lifecycle authority. “Operational” is the stored active status." />
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className={cx('text-[11px] font-bold px-2.5 py-1 rounded-full border', o.lifecycle === 'operational' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-400 border-slate-200')}>operational</span>
              <span className="text-slate-300 text-xs">⇄</span>
              <span className={cx('text-[11px] font-bold px-2.5 py-1 rounded-full border', o.lifecycle === 'suspended' ? 'bg-amber-500 text-white border-amber-500' : 'text-slate-400 border-slate-200')}>suspended</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className={cx('text-[11px] font-bold px-2.5 py-1 rounded-full border', o.lifecycle === 'closed' ? 'bg-slate-500 text-white border-slate-500' : 'text-slate-400 border-slate-200')}>closed · terminal</span>
            </div>
            {o.lifecycleNote && <Notice tone="warn" title={`${o.lifecycle === 'closed' ? 'Closed' : 'Suspended'} ${relTime(o.lifecycleNote.at)}`}>“{o.lifecycleNote.reason}” <span className="text-amber-800/70">(from the Stage 2 audit event)</span></Notice>}
            <div className="mt-4">{lifecycleActions}</div>
          </Card>
          <Card className="lg:col-span-2" tone="muted">
            <CardHeader title="Factual eligibility gate" hint="Whether this Organisation is currently admitted and operational. This is not a CU or entitlement decision." />
            <div className="flex items-center gap-2 flex-wrap">{el.eligible ? <Chip tone="emerald">Eligible</Chip> : <Chip tone="amber">Not eligible</Chip>}{el.reasons.map((r) => <Mono key={r}>{r}</Mono>)}</div>
            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">Admission, lifecycle and commercial capacity are separate. Suspending is a lifecycle decision, never a synonym for zero CU. Closing is terminal normal operations. Pending admission is an admission condition. A CU grant never admits, suspends, reinstates or closes.</p>
          </Card>
        </div>
      )}

      {tab === 'commercial' && (!canCommercial
        ? <NotAuthorised what="Commercial" permissions={['platform.commercial.account.read', 'platform.commercial.ledger.read']} />
        : (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Commercial continuity" hint="Organisation established → pending admission → operator admits → Basic + 100 complimentary CU → accepted feedback consumes 1 CU each → zero blocks new acceptance → operator confirms approval outside Fedoo → grants a CU pack → acceptance resumes." />
              <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <Field label="Current plan"><TierChip v={o.commercial.tier} /><span className="block text-[10px] text-slate-400 mt-1">Tier and CU are independent.</span></Field>
                <Field label="Current balance"><span className={cx('text-lg font-bold tabular-nums', o.commercial.balance <= 0 ? 'text-rose-600' : 'text-slate-900')}>{o.commercial.balance} CU</span>{o.commercial.balance <= 0 && <span className="block mt-1"><AcceptanceBlockedChip /></span>}</Field>
                <Field label="Initial allowance">100 complimentary CU<span className="block text-[10px] text-slate-400 mt-1">Granted once at establishment · {o.commercial.complimentary ? relTime(o.commercial.complimentary.at) : 'recorded in the ledger'} · not recurring, not a lifecycle state, no timer.</span></Field>
                <Field label="Usage">Accepted feedback consumes 1 CU<span className="block text-[10px] text-slate-400 mt-1">{o.commercial.consumed} CU consumed of {o.commercial.granted} CU granted.</span></Field>
                <Field label="When balance reaches zero">New accepted feedback is blocked.<span className="block text-[10px] text-slate-400 mt-1">History and configuration remain preserved.</span></Field>
                <Field label="Payment automation">Not integrated yet — manual operator process<span className="block text-[10px] text-slate-400 mt-1">Confirm commercial approval outside Fedoo before granting CU. Fedoo stores no bank, invoice or provider record.</span></Field>
              </dl>
              <div className="mt-4"><Btn variant="primary" onClick={cmds.grant}>Grant {pack} CU pack — continue service…</Btn></div>
            </Card>
            {o.commercial.balance <= 0 && (
              <Card tone="danger">
                <CardHeader title="0 CU — new accepted feedback is blocked" hint="A commercial capacity condition. Nothing else changed." />
                <ul className="text-[11px] text-slate-700 space-y-1 leading-relaxed">
                  <li>• Organisation remains <strong>{o.admission}</strong> unless admission is separately changed.</li>
                  <li>• Lifecycle remains <strong>{o.lifecycle}</strong> unless separately suspended or closed.</li>
                  <li>• Historical data and configuration remain preserved.</li>
                  <li>• Granting a CU pack restores acceptance capacity; the Zero-CU Needs Attention item then disappears.</li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <GatedAction held={can('platform.commercial.grant')} permission="platform.commercial.grant"><Btn variant="primary" onClick={cmds.grant}>Grant {pack} CU pack…</Btn></GatedAction>
                  <Btn onClick={() => setTab('attention')}>Open Needs Attention</Btn>
                </div>
              </Card>
            )}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader title="Capacity units (CU)" hint="The ledger is the balance authority." />
              <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                <div><div className={cx('text-4xl font-bold tabular-nums', o.commercial.balance <= 0 ? 'text-rose-600' : 'text-slate-900')}>{o.commercial.balance}</div><div className="text-[11px] text-slate-500">CU remaining</div></div>
                <Field label="Granted">{o.commercial.granted} CU</Field><Field label="Consumed">{o.commercial.consumed} CU</Field><Field label="Tier"><TierChip v={o.commercial.tier} /></Field>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden" aria-hidden><div className="h-full bg-cyan-600" style={{ width: `${Math.min(100, (o.commercial.consumed / Math.max(1, o.commercial.granted)) * 100)}%` }} /></div>
              <div className="text-[10px] text-slate-400 mt-1">{o.commercial.consumed} of {o.commercial.granted} CU consumed · {isComplimentaryOnly(o) ? 'initial complimentary allowance only — no operator grant yet' : 'includes operator-granted CU'}</div>
              {o.commercial.balance <= 0 && <div className="mt-3"><Notice tone="warn" title="Zero CU is a fact, not a verdict">No low-balance threshold is governed, so Fedoo flags only zero. A rejected acceptance rolls back and leaves no durable record. Zero CU does not suspend, close or un-admit the Organisation.</Notice></div>}
              <div className="mt-4 flex flex-wrap gap-2">
                <GatedAction held={can('platform.commercial.grant')} permission="platform.commercial.grant"><Btn variant="primary" onClick={cmds.grant}>Grant {pack} CU pack…</Btn></GatedAction>
                <GatedAction held={can('platform.commercial.tier.change')} permission="platform.commercial.tier.change"><Btn onClick={cmds.tier}>Change tier to {nextTier}…</Btn></GatedAction>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Confirm commercial approval outside Fedoo before granting CU. The pack size is fixed by tier ({pack} CU); projected balance after grant: {o.commercial.balance + pack} CU.</p>
            </Card>
            <Card>
              <CardHeader title="Tier capability" hint="Governed Standard Questions per Feedback Point. Tier never adds CU by itself." />
              <dl className="space-y-3"><Field label="Governed Standard Questions">{o.commercial.tier === 'basic' ? 'Exactly 5' : '5–8'}</Field><Field label="Organisation-authored question">{o.commercial.tier === 'premium' ? 'Permitted' : 'Not permitted'}</Field><Field label="Support">{o.commercial.tier === 'basic' ? 'Standard' : 'Enhanced / priority'}</Field><Field label="Reference">USD-equivalent $10</Field></dl>
              <p className="text-[10px] text-slate-400 mt-3">Changing tier does not grant CU and is not payment success. “Upgrade to Premium” and “payment successful” are not synonyms.</p>
              {o.commercial.complimentary && <Disclosure label="Initial complimentary allowance"><Field label="One-time signup grant">{o.commercial.complimentary.quantity} CU · {relTime(o.commercial.complimentary.at)} · associated with establishment, not recurring, not a Trial.</Field></Disclosure>}
            </Card>
            <Card className="lg:col-span-2"><CardHeader title="CU ledger" hint="Most recent first." />
              <ul className="divide-y divide-slate-100">{o.commercial.ledger.map((l, i) => (
                <li key={i} className="py-2.5 flex items-center justify-between gap-3"><div className="min-w-0"><div className="text-xs font-semibold text-slate-800">{humanize(l.entryType)}{l.entryType === 'signup_grant' ? ' · initial complimentary allowance' : ''}</div><div className="text-[11px] text-slate-500 truncate">{l.reason} · {relTime(l.at)}</div></div><span className={cx('text-xs font-bold tabular-nums', l.quantity < 0 ? 'text-slate-500' : 'text-emerald-700')}>{l.quantity > 0 ? '+' : ''}{l.quantity} CU</span></li>))}</ul></Card>
            <Card><CardHeader title="Tier history" />{o.commercial.tierHistory.length ? <ul className="space-y-2">{o.commercial.tierHistory.map((t, i) => <li key={i} className="text-[11px] text-slate-600"><strong className="text-slate-800">{t.from} → {t.to}</strong> · {relTime(t.at)}<br />“{t.reason}”</li>)}</ul> : <p className="text-[11px] text-slate-500">No tier changes recorded.</p>}</Card>
          </div>
          </div>
        ))}

      {tab === 'feedback' && (f.length ? <div className="grid md:grid-cols-2 gap-3">{f.map((x) => <FpChainRow key={x.id} fp={x} />)}</div> : <EmptyState title="No Feedback Points" body="This Organisation has not established a Feedback Point." />)}

      {tab === 'access' && (people.length ? (
        <Card><CardHeader title="Users & Access" hint="Read-only. Open a user for membership, identity binding and effective access." />
          <ul className="divide-y divide-slate-100">{people.map((m) => (
            <li key={m.id}><button onClick={() => go(`/console/access/${m.id}`)} className="w-full text-left py-3 flex items-center justify-between gap-3 hover:bg-slate-50 -mx-2 px-2 rounded-xl">
              <div><div className="text-xs font-bold text-slate-900">{m.userName}</div><div className="text-[11px] text-slate-500">Membership {m.status} · {m.bindings.length ? `${m.bindings.length} identity binding` : 'no identity binding'}</div></div>
              <ChevronRight className="w-4 h-4 text-slate-300" /></button></li>))}</ul></Card>
      ) : <EmptyState title="No memberships" />)}

      {tab === 'health' && <HealthPanel scopeOrgId={o.id} />}
      {tab === 'attention' && (att.length ? <div className="space-y-3">{att.map((a) => <AttentionCard key={a.id} item={a} showOrg={false} />)}</div> : <EmptyState title="Nothing in the queue for this Organisation" body={`Implemented sources: ${Object.values(CONDITIONS).map((c) => c.label).join(', ')}. Absence is not a health claim.`} icon={<Check className="w-4 h-4" />} />)}
      {tab === 'timeline' && <Card><CardHeader title="Operator timeline" hint="Append-only audit events for this Organisation. Includes support-context entry and exit." /><Timeline events={o.timeline} /></Card>}

      {spec && <CommandDialog spec={spec} onClose={() => setSpec(null)} />}
    </>
  );
};
