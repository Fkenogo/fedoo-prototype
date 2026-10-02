// Pure derivations over the synthetic console model. Each mirrors a production rule
// (named in the comment) so the Experience Reference never invents semantics.
import {
  AttentionItem, Boundary, BoundaryState, BOUNDARY_ORDER, CONDITIONS, DIRECTORY_BOUNDARIES,
  FeedbackPoint, HealthState, NOW, Organisation, clockNow,
} from './model';

// feedback_operations.first_absent_boundary: earliest boundary not proved passed;
// not_applicable never stops the chain; a missing boundary reads as unknown.
export function firstAbsent(states: Record<Boundary, BoundaryState>, order: readonly Boundary[] = BOUNDARY_ORDER): Boundary | null {
  for (const b of order) {
    const s = states[b] ?? 'unknown';
    if (s !== 'passed' && s !== 'not_applicable') return b;
  }
  return null;
}
export const firstAbsentDirectory = (fp: FeedbackPoint) => firstAbsent(fp.states, DIRECTORY_BOUNDARIES);

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
export function relTime(iso?: string | number, now: number = clockNow()): string {
  if (iso === undefined || iso === null) return '—';
  const t = typeof iso === 'number' ? iso : new Date(iso).getTime();
  const s = Math.round((now - t) / 1000);
  if (s < 0) return 'in the future';
  if (s < 90) return 'just now';
  const m = Math.round(s / 60);
  if (m < 90) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 36) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 45) return `${d} d ago`;
  const mo = Math.round(d / 30);
  return `${mo} mo ago`;
}
export const absTime = (iso?: string | number) =>
  iso === undefined || iso === null ? '—' : new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
export const shortId = (id: string) => (id.length > 12 ? `${id.slice(0, 8)}…` : id);
export const humanize = (code: string) => code.replace(/[._]/g, ' ').replace(/\s+/g, ' ').trim();
export const BOUNDARY_LABEL: Record<Boundary, string> = {
  public_ref: 'Link', endpoint: 'Feedback Point', configuration: 'Configuration', session: 'Session',
  submission: 'Submission', acceptance: 'Acceptance', evidence: 'Evidence', result: 'Result', signal: 'Signal',
};

// ---------------------------------------------------------------------------
// Organisation helpers
// ---------------------------------------------------------------------------
export const fpsOf = (orgId: string, all: FeedbackPoint[]) => all.filter((f) => f.orgId === orgId);
export const attentionOf = (orgId: string, items: AttentionItem[]) => items.filter((i) => i.orgId === orgId);

// organisation_operations.organisation_eligibility: factual gate, no CU decision.
export function eligibility(o: Organisation) {
  const reasons: string[] = [];
  if (o.admission !== 'admitted') reasons.push('not_admitted');
  if (o.lifecycle !== 'operational') reasons.push('not_operational');
  return { eligible: reasons.length === 0, reasons };
}

// Org-level roll-up of Feedback Point diagnostics (presentation only).
export function worstChain(fps: FeedbackPoint[]): { stoppedAt: number; total: number } {
  const stopped = fps.filter((f) => firstAbsentDirectory(f) !== null).length;
  return { stoppedAt: stopped, total: fps.length };
}

// "Relevant next action" is the owning command named by the Needs Attention item,
// else the admission/lifecycle fact. It never invokes a command.
export function nextAction(o: Organisation, items: AttentionItem[]): { label: string; route?: string } | null {
  const att = attentionOf(o.id, items);
  const rank = { alert: 0, action_required: 1, informational: 2, unassigned: 3 } as const;
  const top = [...att].sort((a, b) => rank[CONDITIONS[a.condition].severity] - rank[CONDITIONS[b.condition].severity])[0];
  if (top) return { label: top.action.label.replace('…', ''), route: top.action.route };
  if (o.lifecycle === 'suspended') return { label: 'Review suspension', route: `/console/organisations/${o.id}?tab=admission` };
  return null;
}

// ---------------------------------------------------------------------------
// Platform Health composition (platform_health.feedback_point_facts + inventories)
// ---------------------------------------------------------------------------
export interface HealthFact {
  path: string; condition: string; state: HealthState; reason?: string | null; classification?: string | null;
  source: string; observability: 'observed_directly' | 'derived' | 'not_observed' | 'unavailable';
  observedAt: string; sourceEventAt?: string;
  orgId?: string; fpId?: string; counts?: Partial<Record<HealthState, number>>; note?: string;
}
export const HEALTH_SECTION_ORDER = [
  'participant_access', 'feedback_operations', 'product_acceptance', 'evidence', 'results', 'signals',
  'organisation_readiness', 'commercial_capacity', 'access', 'catalogue', 'runtime_dependencies',
] as const;
export type HealthSectionKey = (typeof HEALTH_SECTION_ORDER)[number];

export const HEALTH_SECTION_META: Record<HealthSectionKey, { label: string; customer: string; scope: 'product' | 'inventory' | 'platform' }> = {
  participant_access: { label: 'Participant access', customer: 'Can a participant open a Feedback Point link?', scope: 'product' },
  feedback_operations: { label: 'Feedback Points', customer: 'Do Feedback Points resolve, stay available and present usable questions?', scope: 'product' },
  product_acceptance: { label: 'Product acceptance', customer: 'Do Submissions become accepted Evidence?', scope: 'product' },
  evidence: { label: 'Evidence', customer: 'Is accepted Evidence being recorded?', scope: 'product' },
  results: { label: 'Results', customer: 'Can Measure Results be calculated from that Evidence?', scope: 'product' },
  signals: { label: 'Signals', customer: 'Do Service Signals follow from Results?', scope: 'product' },
  organisation_readiness: { label: 'Organisation readiness', customer: 'How many Organisations are admitted and operational?', scope: 'inventory' },
  commercial_capacity: { label: 'Commercial capacity', customer: 'Which Organisations have CU remaining?', scope: 'inventory' },
  access: { label: 'Users & access', customer: 'Are users bound to memberships? Provider account state is not visible.', scope: 'inventory' },
  catalogue: { label: 'Catalogue', customer: 'Is the governed catalogue valid and consistent at runtime?', scope: 'platform' },
  runtime_dependencies: { label: 'Runtime dependencies', customer: 'What can Fedoo observe about the platform it runs on?', scope: 'platform' },
};

const b2h = (s: BoundaryState): HealthState =>
  s === 'passed' ? 'healthy_observed' : s === 'failed' ? 'failed_observed' : s === 'not_observed' ? 'not_observed' : s === 'not_applicable' ? 'not_applicable' : 'unknown';
const OBS = NOW.toISOString();

export function feedbackPointFacts(fp: FeedbackPoint): HealthFact[] {
  const s = fp.states;
  const f = (path: string, condition: string, state: HealthState, extra: Partial<HealthFact> = {}): HealthFact => ({
    path, condition, state, source: 'Feedback Point diagnostic (Stage 4 owner)', observability: 'derived',
    observedAt: OBS, orgId: fp.orgId, fpId: fp.id, ...extra,
  });
  const gap = fp.classification === 'analytical_readiness_gap';
  const tech = fp.classification === 'technical_failure';
  const result: HealthState = tech ? 'failed_observed' : gap ? 'degraded_observed' : b2h(s.result);
  return [
    f('feedback_operations', 'public_link_resolves', b2h(s.public_ref), { reason: s.public_ref === 'passed' ? null : 'public_ref_unresolved' }),
    f('feedback_operations', 'feedback_point_available', b2h(s.endpoint), { reason: s.endpoint === 'passed' ? null : `lifecycle_${fp.lifecycle}` }),
    f('feedback_operations', 'configuration_usable', b2h(s.configuration), { reason: fp.configReason ?? (s.configuration === 'not_observed' ? 'no_effective_configuration' : null) }),
    f('feedback_operations', 'sessions_in_window', b2h(s.session), { reason: s.session === 'not_observed' ? 'no_session_in_window' : null, sourceEventAt: fp.last.session }),
    f('product_acceptance', 'acceptance_integrity', b2h(s.acceptance), { reason: fp.integrityFindings?.[0] ?? (s.acceptance === 'not_observed' ? 'no_acceptance_in_window' : null), sourceEventAt: fp.last.acceptance }),
    f('evidence', 'evidence_recorded', b2h(s.evidence), { reason: s.evidence === 'not_observed' ? 'no_evidence_in_window' : null, sourceEventAt: fp.last.evidence }),
    f('results', 'result_calculation', result, { reason: tech ? 'result_calculation_exception' : gap ? 'calculation_rule_unavailable' : s.result === 'not_observed' ? 'no_evidence_in_window' : null, classification: tech ? 'technical_failure' : gap ? 'analytical_readiness_gap' : null, note: gap ? 'Distinct from configuration readiness; the Feedback Point stays operational.' : undefined }),
    f('signals', 'signal_derivation', tech ? 'unknown' : b2h(s.signal), { reason: tech ? 'depends_on_result' : s.signal === 'not_observed' ? 'no_signal_observed' : null, sourceEventAt: fp.last.signal }),
  ];
}

export function fixedFacts(): Record<string, HealthFact[]> {
  const nf = (path: string, condition: string, reason: string, source: string, state: HealthState = 'not_observed'): HealthFact =>
    ({ path, condition, state, reason, source, observability: state === 'unavailable' ? 'unavailable' : 'not_observed', observedAt: OBS });
  return {
    participant_access: [nf('participant_access', 'request_telemetry', 'no_request_telemetry', 'No request telemetry source exists')],
    product_acceptance: [nf('product_acceptance', 'rejection_telemetry', 'no_durable_rejection_record', 'Rejected acceptances roll back; no failure reason is persisted')],
    runtime_dependencies: [
      { path: 'runtime_dependencies', condition: 'database_connectivity', state: 'healthy_observed', reason: 'probe_query_answered', source: 'Live probe: a trivial query executed by this read', observability: 'observed_directly', observedAt: OBS, note: 'Connectivity only; not a database health or SLA claim.' },
      nf('runtime_dependencies', 'database_migration', 'no_migration_ledger', 'No runtime migration ledger; CI validity is release evidence'),
      nf('runtime_dependencies', 'application_runtime', 'no_runtime_telemetry', 'No runtime telemetry'),
      nf('runtime_dependencies', 'authentication_provider', 'provider_health_not_exposed_by_adapter', 'Provider-neutral adapter exposes no operational telemetry', 'unavailable'),
      nf('runtime_dependencies', 'edge_delivery', 'no_deployment_telemetry', 'Edge/delivery provider is not assumed'),
      nf('runtime_dependencies', 'background_processing', 'no_background_processing_component', 'No background worker exists in the current runtime', 'not_applicable'),
      nf('runtime_dependencies', 'storage', 'no_storage_telemetry', 'No storage telemetry'),
    ],
    catalogue: [
      { path: 'catalogue', condition: 'canonical_measure_catalogue_validity', state: 'healthy_observed', source: 'Repository catalogue validated at read time', observability: 'observed_directly', observedAt: OBS, reason: '88 Measures valid' },
      { path: 'catalogue', condition: 'calculation_registry_seed', state: 'healthy_observed', source: 'Calculation registry seeded from repository', observability: 'observed_directly', observedAt: OBS },
      { path: 'catalogue', condition: 'runtime_projection_consistency', state: 'failed_observed', reason: 'multiple_active_question_versions', source: 'Runtime projection compared with repository', observability: 'observed_directly', observedAt: OBS, classification: 'integrity' },
    ],
    access: [nf('access', 'provider_account_state', 'provider_account_state_not_exposed_by_adapter', 'Provider-neutral authentication adapter', 'unavailable')],
  };
}

export function rollup(states: HealthState[]): HealthState {
  const applicable: HealthState[] = states.filter((s) => s !== 'not_applicable');
  if (!applicable.length) return 'not_applicable';
  for (const c of ['failed_observed', 'degraded_observed', 'unavailable', 'unknown', 'not_observed'] as HealthState[]) {
    if (applicable.includes(c)) return c;
  }
  return 'healthy_observed';
}
export function countStates(states: HealthState[]) {
  const out: Partial<Record<HealthState, number>> = {};
  states.forEach((s) => { out[s] = (out[s] ?? 0) + 1; });
  return out;
}

// Inventory facts are `not_applicable`: by-design states (pending admission, exhaustion) carry no health judgement.
export function inventoryFacts(orgs: Organisation[], scopeOrgId?: string): Record<string, HealthFact[]> {
  const list = scopeOrgId ? orgs.filter((o) => o.id === scopeOrgId) : orgs;
  const inv = (path: string, condition: string, note: string, source: string, orgId?: string): HealthFact =>
    ({ path, condition, state: 'not_applicable', classification: 'inventory', source, observability: 'observed_directly', observedAt: OBS, note, orgId });
  const adm = (a: string, l: string) => list.filter((o) => o.admission === a && o.lifecycle === l).length;
  return {
    organisation_readiness: [inv('organisation_readiness', scopeOrgId ? 'admission_and_lifecycle' : 'admission_and_lifecycle_inventory',
      scopeOrgId ? `${list[0].admission} · ${list[0].lifecycle}` : `${adm('admitted', 'operational')} admitted & operational · ${adm('pending', 'operational')} pending · ${adm('admitted', 'suspended')} suspended · ${adm('admitted', 'closed')} closed`,
      'organisation_admissions and organisations.status (Stage 2 owners)', scopeOrgId)],
    commercial_capacity: [inv('commercial_capacity', scopeOrgId ? 'capacity' : 'capacity_inventory',
      scopeOrgId ? `${list[0].commercial.balance} CU · ${list[0].commercial.tier} · low-balance threshold: not governed` : `${list.filter((o) => o.admission === 'admitted' && o.lifecycle === 'operational' && o.commercial.balance <= 0).length} of ${list.filter((o) => o.admission === 'admitted' && o.lifecycle === 'operational').length} admitted Organisations at zero CU · low-balance threshold: not governed`,
      'commercial_ledger balance (Stage 3 owner)', scopeOrgId)],
    access: [inv('access', 'membership_and_binding_inventory',
      `${list.reduce((n, o) => n + o.members.active, 0)} active memberships`, 'memberships and identity_bindings (Stage 5 owners)', scopeOrgId)],
  };
}
