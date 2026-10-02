import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ATTENTION, AttentionItem, AuditEvent, CATALOGUE_CONSTRUCTS, CatalogueConstruct, clockNow, FEEDBACK_POINTS,
  FeedbackPoint, MEMBERSHIPS, Membership, OPERATORS, OperatorProfile, ORGANISATIONS, Organisation,
  PRIOR_SUPPORT_CONTEXT, SupportContext,
} from './model';

// ---------------------------------------------------------------------------
// Hash routing: every Console screen is a stable, shareable review route.
//   #/console/organisations   #/console/organisations/<id>?tab=commercial   #/console/feedback/<fp>
// ---------------------------------------------------------------------------
export interface Route { path: string; segments: string[]; query: URLSearchParams }
export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/console';
  const [path, qs = ''] = raw.split('?');
  const segments = path.split('/').filter(Boolean).slice(1); // drop "console"
  return { path, segments, query: new URLSearchParams(qs) };
}
export const consoleHref = (path: string) => `#${path}`;

interface Ctx {
  route: Route; go: (path: string) => void;
  operator: OperatorProfile; setOperatorId: (id: OperatorProfile['id']) => void;
  can: (permission: string) => boolean;
  orgs: Organisation[]; fps: FeedbackPoint[]; memberships: Membership[]; attention: AttentionItem[];
  constructs: CatalogueConstruct[]; supportContexts: SupportContext[];
  orgById: (id: string) => Organisation | undefined;
  admit: (id: string, reason: string) => void;
  setLifecycle: (id: string, to: 'suspended' | 'operational' | 'closed', reason: string) => void;
  grantPack: (id: string, reason: string) => void;
  changeTier: (id: string, reason: string) => void;
  catalogueCommand: (id: string, action: 'publish' | 'retire', reason: string) => void;
  enterSupport: (orgId: string, reason: string) => string;
  exitSupport: (id: string, reason: string) => void;
  activeSupport: SupportContext | undefined;
  tick: number;
}
const ConsoleCtx = createContext<Ctx | null>(null);
export const useConsole = () => {
  const c = useContext(ConsoleCtx);
  if (!c) throw new Error('useConsole outside ConsoleProvider');
  return c;
};

const iso = () => new Date(clockNow()).toISOString();
const ev = (action: string, reason: string, source: string, before?: string, after?: string): AuditEvent =>
  ({ at: iso(), action, result: 'allowed', reason, source, before, after });

export const ConsoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hash, setHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const route = useMemo(() => parseRoute(hash), [hash]);
  const go = useCallback((path: string) => { window.location.hash = path; window.scrollTo?.({ top: 0 }); }, []);

  const [operatorId, setOperatorId] = useState<OperatorProfile['id']>('full');
  const operator = OPERATORS.find((o) => o.id === operatorId)!;
  const can = useCallback((p: string) => operator.held.has(p), [operator]);

  const [orgs, setOrgs] = useState<Organisation[]>(ORGANISATIONS);
  const [constructs, setConstructs] = useState<CatalogueConstruct[]>(CATALOGUE_CONSTRUCTS);
  const [supportContexts, setSupportContexts] = useState<SupportContext[]>(() => {
    const t = clockNow();
    return [
      { id: 'sc-live', orgId: ORGANISATIONS[3].id, operator: 'Amara Okello', purpose: 'organisation-support', reason: 'Organisation reports Submissions are not being counted', enteredAt: t - 6 * 60_000, expiresAt: t + 24 * 60_000 },
      PRIOR_SUPPORT_CONTEXT,
    ];
  });
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick((t) => t + 1), 30_000); return () => clearInterval(i); }, []);

  const patchOrg = (id: string, fn: (o: Organisation) => Organisation) => setOrgs((all) => all.map((o) => (o.id === id ? fn(o) : o)));

  const admit: Ctx['admit'] = (id, reason) => patchOrg(id, (o) => ({
    ...o, admission: 'admitted', admissionProvenance: 'operator', admittedAt: iso(),
    timeline: [ev('platform.organisation.admission.admit', reason, 'operator-organisation-operations', 'pending', 'admitted'), ...o.timeline],
  }));
  const setLifecycle: Ctx['setLifecycle'] = (id, to, reason) => patchOrg(id, (o) => ({
    ...o, lifecycle: to, lifecycleNote: to === 'operational' ? undefined : { at: iso(), reason },
    timeline: [ev(to === 'suspended' ? 'platform.organisation.lifecycle.suspend' : to === 'closed' ? 'platform.organisation.lifecycle.close' : 'platform.organisation.lifecycle.reinstate', reason, 'operator-organisation-operations', o.lifecycle, to), ...o.timeline],
  }));
  const grantPack: Ctx['grantPack'] = (id, reason) => patchOrg(id, (o) => {
    const q = o.commercial.tier === 'basic' ? 100 : 50;
    return {
      ...o, commercial: {
        ...o.commercial, balance: o.commercial.balance + q, granted: o.commercial.granted + q,
        ledger: [{ at: iso(), entryType: 'operator_grant', quantity: q, source: 'operator-commercial-operations', reason }, ...o.commercial.ledger],
      },
      timeline: [ev('platform.commercial.grant', reason, 'operator-commercial-operations', `balance ${o.commercial.balance}`, `balance ${o.commercial.balance + q}`), ...o.timeline],
    };
  });
  const changeTier: Ctx['changeTier'] = (id, reason) => patchOrg(id, (o) => {
    const to = o.commercial.tier === 'basic' ? 'premium' : 'basic';
    return {
      ...o, commercial: { ...o.commercial, tier: to, tierHistory: [{ at: iso(), from: o.commercial.tier, to, reason }, ...o.commercial.tierHistory] },
      timeline: [ev('platform.commercial.tier.change', reason, 'operator-commercial-operations', o.commercial.tier, to), ...o.timeline],
    };
  });
  const catalogueCommand: Ctx['catalogueCommand'] = (id, action) =>
    setConstructs((all) => all.map((c) => (c.id === id ? { ...c, status: action === 'publish' ? 'active' : 'retired', updated: iso(), permission: 'platform.catalogue.retire', gates: [] } : c)));
  const enterSupport: Ctx['enterSupport'] = (orgId, reason) => {
    const t = clockNow();
    const id = `sc-${t}`;
    setSupportContexts((all) => [{ id, orgId, operator: operator.name, purpose: 'organisation-support', reason, enteredAt: t, expiresAt: t + 30 * 60_000 }, ...all]);
    return id;
  };
  const exitSupport: Ctx['exitSupport'] = (id) => setSupportContexts((all) => all.map((c) => (c.id === id ? { ...c, endedAt: clockNow() } : c)));
  const activeSupport = supportContexts.find((c) => !c.endedAt && c.expiresAt > clockNow());

  // Needs Attention is derived: an item exists exactly while its owning condition holds.
  const attention = useMemo<AttentionItem[]>(() => {
    const dyn: AttentionItem[] = [];
    orgs.forEach((o) => {
      if (o.admission === 'pending') dyn.push({
        id: `pending-${o.id}`, condition: 'organisation_pending_admission', orgId: o.id,
        stateDetail: `Admission is pending; established ${new Date(o.establishedAt).toISOString().slice(0, 10)} by ${o.admissionProvenance}.`,
        firstObserved: o.establishedAt, firstObservedBasis: 'Organisation establishment time',
        evidence: { admission: 'pending', provenance: o.admissionProvenance, setup: o.setup.state },
        action: { label: 'Admit Organisation…', owner: 'organisation_operations', permission: 'platform.organisation.admission.admit', route: `/console/organisations/${o.id}?tab=admission` },
      });
      if (o.admission === 'admitted' && o.lifecycle === 'operational' && o.commercial.balance <= 0) dyn.push({
        id: `zero-${o.id}`, condition: 'commercial_capacity_exhausted', orgId: o.id,
        stateDetail: 'Balance is 0 CU.', firstObserved: o.commercial.ledger[0]?.at ?? o.establishedAt,
        firstObservedBasis: 'Effective time of the ledger entry that took the balance to 0',
        evidence: { balance: `${o.commercial.balance} CU`, tier: o.commercial.tier },
        action: { label: 'Grant CU pack…', owner: 'commercial', permission: 'platform.commercial.grant', route: `/console/organisations/${o.id}?tab=commercial` },
      });
    });
    const statics = ATTENTION.filter((a) => a.condition !== 'organisation_pending_admission' && a.condition !== 'commercial_capacity_exhausted');
    return [...statics, ...dyn];
  }, [orgs]);

  const value: Ctx = {
    route, go, operator, setOperatorId, can, orgs, fps: FEEDBACK_POINTS, memberships: MEMBERSHIPS, attention, constructs,
    supportContexts, orgById: (id) => orgs.find((o) => o.id === id), admit, setLifecycle, grantPack, changeTier,
    catalogueCommand, enterSupport, exitSupport, activeSupport, tick,
  };
  return <ConsoleCtx.Provider value={value}>{children}</ConsoleCtx.Provider>;
};
