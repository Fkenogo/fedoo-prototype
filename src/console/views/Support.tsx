import React, { useState } from 'react';
import { LifeBuoy, ShieldAlert, Timer } from 'lucide-react';
import { useConsole } from '../store';
import { absTime, attentionOf, feedbackPointFacts, fpsOf, relTime, rollup } from '../derive';
import { clockNow } from '../model';
import {
  AdmissionChip, Btn, Card, CardHeader, Chip, CommandDialog, CommandSpec, cx, CuChip, EmptyState, Eyebrow, Field, HealthChip, LifecycleChip, Mono, Notice,
  NotAuthorised, PageHeader, ScopeChip, Select, SetupChip, TierChip,
} from '../ui';
import { AttentionCard, FpChainRow, OrgLink } from './shared';
import { Timeline } from './Organisations';

const stateOf = (c: { endedAt?: number; expiresAt: number }) => (c.endedAt ? 'ended' : c.expiresAt <= clockNow() ? 'expired' : 'active');

export const SupportEntryView: React.FC = () => {
  const { supportContexts, orgs, orgById, go, can, enterSupport } = useConsole();
  const [org, setOrg] = useState(orgs[2].id);
  const [spec, setSpec] = useState<CommandSpec | null>(null);
  const canEnter = can('platform.support.context.enter');
  const begin = () => {
    const o = orgById(org)!;
    setSpec({
      title: 'Enter read-only support context', verb: 'Enter read-only support context', permission: 'platform.support.context.enter', expected: 'No active context for this Organisation',
      phrase: `ENTER SUPPORT CONTEXT ${o.id}`, summary: <>Open a bounded, 30-minute, read-only context for <strong>{o.name}</strong>. You stay yourself throughout.</>,
      consequences: ['No customer identity, membership, role, scope or Evidence Class is created.', 'No impersonation: no customer token or session is issued.', 'No mutation: every command keeps its own independent permission.', 'Entry and exit are audited.'],
      onConfirm: (r) => { const id = enterSupport(o.id, r); go(`/console/support/${o.id}/${id}`); },
    });
  };
  return (
    <>
      <PageHeader title="Support" scope={<ScopeChip kind="platform" />}
        subtitle="A bounded, time-limited, read-only context for one Organisation. You remain the operator: nothing here impersonates a customer, shows Evidence, stores notes or changes any Organisation." />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Your contexts" hint="Expired and ended contexts are history only and can never be revived." />
          <ul className="space-y-2.5">{supportContexts.map((c) => {
            const st = stateOf(c);
            const left = Math.max(0, Math.round((c.expiresAt - clockNow()) / 60000));
            return (
              <li key={c.id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0"><div className="text-xs font-bold text-slate-900 truncate">{orgById(c.orgId)?.name}</div><div className="text-[10px] text-slate-500">{st === 'active' ? `${left} min left` : st === 'ended' ? `Ended ${relTime(c.endedAt)}` : `Expired ${relTime(c.expiresAt)}`}</div></div>
                {st === 'active' ? <Btn variant="primary" onClick={() => go(`/console/support/${c.orgId}/${c.id}`)}>Open workspace</Btn> : <Chip tone="slate">History only</Chip>}
              </li>);
          })}</ul>
        </Card>
        <Card>
          <CardHeader title="Enter a support context" hint="Needs the exact support permission for the Organisation, a reason and a typed confirmation." icon={<LifeBuoy className="w-4 h-4" />} />
          {canEnter ? (
            <div className="space-y-3"><Select label="Organisation" value={org} onChange={setOrg} options={orgs.map((o) => ({ id: o.id, label: o.name }))} /><Btn variant="primary" onClick={begin}>Enter read-only support context…</Btn></div>
          ) : <NotAuthorised what="Support context entry" permissions={['platform.support.context.enter']} />}
          <p className="text-[11px] text-slate-500 mt-3">You hold no support-context permission for any Organisation when this control is locked.</p>
        </Card>
      </div>
      {spec && <CommandDialog spec={spec} onClose={() => setSpec(null)} />}
    </>
  );
};

const NOT_CONFERRED = [['Customer identity', 'none — the operator identity is retained'], ['Organisation membership', 'none — no role, scope or Evidence Class'], ['Impersonation', 'none — no customer token or session'], ['Mutation', 'none — every command keeps its own permission']];

const Section: React.FC<{ id: string; title: string; hint?: string; children: React.ReactNode; right?: React.ReactNode }> = ({ id, title, hint, children, right }) => (
  <section id={id} className="scroll-mt-32"><Card><CardHeader title={title} hint={hint} right={right} />{children}</Card></section>
);

export const SupportWorkspaceView: React.FC<{ orgId: string; contextId: string }> = ({ orgId, contextId }) => {
  const c = useConsole();
  const { supportContexts, orgById, fps, attention, memberships, can, go, exitSupport, operator } = c;
  const [denied, setDenied] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [exitReason, setExitReason] = useState('');
  const ctx = supportContexts.find((x) => x.id === contextId && x.orgId === orgId);
  const o = orgById(orgId);
  if (!ctx || !o) return <EmptyState title="Support context not found" body="A context belongs to one operator and one Organisation. The URL is never authority." />;
  const st = stateOf(ctx);
  const left = Math.max(0, Math.round((ctx.expiresAt - clockNow()) / 60000));
  if (st !== 'active') {
    return (
      <>
        <PageHeader title="Support workspace" scope={<ScopeChip kind="support" name={o.name} />} />
        <Notice tone="warn" title={`This support context has ${st}`}>Expired or ended contexts are history only. The workspace shows nothing until a new, audited context is entered.</Notice>
        <div className="mt-4"><Btn variant="primary" onClick={() => go('/console/support')}>Back to Support</Btn></div>
      </>
    );
  }
  const f = fpsOf(o.id, fps);
  const att = attentionOf(o.id, attention);
  const people = memberships.filter((m) => m.orgId === o.id);
  const health = f.length ? rollup(f.flatMap(feedbackPointFacts).map((x) => x.state)) : 'not_observed';
  const canCommercial = can('platform.commercial.account.read') && can('platform.commercial.ledger.read');
  const anchors = [['summary', 'Summary'], ['commercial', 'Commercial'], ['access', 'Users & access'], ['feedback', 'Feedback'], ['health', 'Health'], ['attention', 'Needs attention'], ['timeline', 'Timeline'], ['evidence', 'Evidence']];
  return (
    <>
      <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 sm:p-5 mb-5 sticky top-[6.9rem] z-30 shadow-sm" role="status">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap"><ShieldAlert className="w-4 h-4 text-amber-700" /><span className="text-[11px] uppercase tracking-wider font-bold text-amber-900">Operator support context · read-only</span><Chip tone="amber" icon={<Timer className="w-3 h-3" />}>{left} min left · expires {absTime(ctx.expiresAt)}</Chip></div>
            <div className="text-sm font-bold text-slate-900 mt-1.5">Supporting <OrgLink id={o.id} className="text-sm" /></div>
            <div className="text-[11px] text-slate-700 mt-1">Operator <strong>{ctx.operator}</strong> · purpose <Mono>{ctx.purpose}</Mono> · reason “{ctx.reason}”</div>
          </div>
          <div className="shrink-0"><Btn onClick={() => setExiting(true)}>Exit support context</Btn></div>
        </div>
        <ul className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1">{NOT_CONFERRED.map(([k, v]) => <li key={k} className="text-[10px] text-amber-900/80"><strong>{k}:</strong> {v}</li>)}</ul>
      </div>
      <PageHeader title="Organisation support workspace" scope={<ScopeChip kind="support" name={o.name} />} subtitle="Composed from the same read models as the rest of the console. Each section still needs its own permission; the banner grants no read by itself." />
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-5">{anchors.map(([id, l]) => <a key={id} href={`#/console/support/${orgId}/${contextId}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }} className="whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900">{l}</a>)}</div>
      <div className="space-y-4">
        <Section id="summary" title="Organisation summary" right={<div className="flex gap-1.5"><AdmissionChip v={o.admission} /><LifecycleChip v={o.lifecycle} /><SetupChip v={o.setup.state} /></div>}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><Field label="Sector">{o.sector}</Field><Field label="Location">{o.city}, {o.country}</Field><Field label="Established">{relTime(o.establishedAt)}</Field><Field label="Locations">{o.locations.map((l) => l.name).join(', ')}</Field></div>
        </Section>
        <Section id="commercial" title="Commercial">{canCommercial ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><Field label="Tier"><TierChip v={o.commercial.tier} /></Field><Field label="Balance"><CuChip balance={o.commercial.balance} /></Field><Field label="Consumed">{o.commercial.consumed} of {o.commercial.granted} CU</Field><Field label="Latest ledger entry">{o.commercial.ledger[0] ? `${o.commercial.ledger[0].quantity > 0 ? '+' : ''}${o.commercial.ledger[0].quantity} CU · ${relTime(o.commercial.ledger[0].at)}` : '—'}</Field></div>
        ) : <NotAuthorised what="Commercial" permissions={['platform.commercial.account.read', 'platform.commercial.ledger.read']} />}</Section>
        <Section id="access" title="Users & access" hint="Provider identity is withheld; recovery is unavailable through the adapter.">
          <ul className="divide-y divide-slate-100">{people.map((m) => <li key={m.id} className="py-2 flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-800">{m.userName}</span><span className="flex gap-1.5"><Chip tone={m.status === 'active' ? 'emerald' : m.status === 'suspended' ? 'amber' : 'slate'}>{m.status}</Chip><Chip tone="slate">{m.bindings.length ? 'bound' : 'no binding'}</Chip></span></li>)}</ul>
          <div className="mt-3"><HealthChip state="unavailable" label="Recovery unavailable" /></div>
        </Section>
        <Section id="feedback" title="Feedback diagnostics" hint="Where each chain stops. No Evidence content.">{f.length ? <div className="grid md:grid-cols-2 gap-2.5">{f.map((x) => <FpChainRow key={x.id} fp={x} />)}</div> : <EmptyState title="No Feedback Points" />}</Section>
        <Section id="health" title="Health"><HealthChip state={health} /><p className="text-[11px] text-slate-500 mt-2">Observation roll-up of this Organisation’s product path. Not a score or SLA.</p></Section>
        <Section id="attention" title="Needs attention">{att.length ? <div className="space-y-3">{att.map((a) => <AttentionCard key={a.id} item={a} showOrg={false} />)}</div> : <p className="text-xs text-slate-600">No implemented source currently reports a condition for this Organisation.</p>}</Section>
        <Section id="timeline" title="Timeline" hint="Events only; nothing is inferred from absence. Includes support-context entry and exit."><Timeline events={o.timeline} limit={5} /></Section>
        <Section id="evidence" title="Evidence"><Notice tone="warn" title="Verbatim Evidence is denied">No separately approved sensitive Evidence permission exists, and entering a support context never confers one. Participant answers, comments, custom free text, raw Evidence values and participant identifiers are never returned. There are no support notes.</Notice></Section>
        <Card tone="muted">
          <CardHeader title="Independent permissions still required" hint="Opening this context grants none of them." />
          <div className="flex flex-wrap gap-1.5 mb-3">{['platform.organisation.lifecycle.suspend', 'platform.organisation.admission.admit', 'platform.commercial.grant', 'platform.commercial.tier.change', 'platform.catalogue.publish', 'platform.catalogue.retire'].map((p) => <Mono key={p}>{p}</Mono>)}</div>
          <Btn onClick={() => setDenied(true)}>Try to suspend this Organisation (demonstrates the denial)</Btn>
          {denied && <div className="mt-3"><Notice tone="warn" title="Denied">A support context is not authority to change anything. The suspend command re-checks its own permission and never consults this context. {operator.id === 'full' ? 'Use the Organisation page to run it under your own permission.' : ''}</Notice></div>}
        </Card>
      </div>
      {exiting && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Exit support context">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setExiting(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-slate-200 shadow-2xl">
            <Eyebrow>Exit support context</Eyebrow><h2 className="text-base font-bold text-slate-900 mt-1">Leave {o.name}</h2>
            <p className="text-xs text-slate-600 mt-2">Relinquishing your own context needs no extra grant. The exit is audited.</p>
            <label className="block mt-3 text-[11px] font-semibold text-slate-600">Reason<textarea value={exitReason} onChange={(e) => setExitReason(e.target.value)} rows={2} maxLength={500} className="mt-1 w-full text-xs rounded-xl border border-slate-200 px-3 py-2" /></label>
            <div className="mt-4 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setExiting(false)}>Cancel</Btn><Btn variant="primary" disabled={!exitReason.trim()} onClick={() => { exitSupport(ctx.id, exitReason); setExiting(false); go('/console/support'); }}>Exit support context</Btn></div>
          </div>
        </div>
      )}
    </>
  );
};
void cx;
