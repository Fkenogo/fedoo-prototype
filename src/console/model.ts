// ============================================================================
// FEDOO OPERATOR CONSOLE — EXPERIENCE REFERENCE FIXTURES (NON-AUTHORITATIVE)
// ============================================================================
// Synthetic states shaped on the REAL FOA-001 Stage 1–8 read models of
// Fkenogo/fedoo @ 507be9f (organisation_operations, commercial, feedback_operations,
// access_operations, platform_health, needs_attention, catalogue_workspace,
// platform_settings, support_context). Vocabulary (admission, lifecycle, boundary
// states, health states, condition names, permission names) is copied from those
// services. Organisation names, people, counts and times are invented for review.
// This file defines NO Product Truth and must never be imported into production.
// ============================================================================

export type Admission = 'pending' | 'admitted';
export type Lifecycle = 'operational' | 'suspended' | 'closed';
export type Tier = 'basic' | 'premium';
export type SetupState = 'complete' | 'incomplete';

export type BoundaryState = 'passed' | 'failed' | 'not_observed' | 'unknown' | 'not_applicable';
export const BOUNDARY_ORDER = [
  'public_ref', 'endpoint', 'configuration', 'session', 'submission', 'acceptance',
  'evidence', 'result', 'signal',
] as const;
export type Boundary = (typeof BOUNDARY_ORDER)[number];
// The platform directory evaluates the first seven; Result and Signal are
// calculation-on-read per Measure and exist only in the Feedback Point diagnostic.
export const DIRECTORY_BOUNDARIES: Boundary[] = BOUNDARY_ORDER.slice(0, 7) as unknown as Boundary[];

export type HealthState =
  | 'healthy_observed' | 'degraded_observed' | 'failed_observed' | 'unavailable'
  | 'not_observed' | 'unknown' | 'not_applicable';

export const NOW = new Date('2026-10-02T09:14:00Z');
// The review clock starts at NOW and advances in real time, so synthetic timestamps,
// support-context expiry and newly written audit events stay mutually consistent.
const LOADED_AT = Date.now();
export const clockNow = () => NOW.getTime() + (Date.now() - LOADED_AT);

export interface LedgerEntry { at: string; entryType: string; quantity: number; source: string; reason: string }
export interface TierChange { at: string; from: Tier; to: Tier; reason: string }
export interface Commercial {
  tier: Tier; balance: number; granted: number; consumed: number;
  complimentary?: { entryType: string; quantity: number; at: string };
  ledger: LedgerEntry[]; tierHistory: TierChange[];
}
export interface AuditEvent { at: string; action: string; result: 'allowed' | 'denied'; reason: string; source: string; before?: string; after?: string }
export interface Location { id: string; name: string; city: string }

export interface Organisation {
  id: string; name: string; country: string; city: string; sector: string; timezone: string;
  adminContact: string; adminLanguage: string; feedbackLanguages: string[];
  establishedAt: string; admission: Admission; admissionProvenance: string; admittedAt?: string;
  lifecycle: Lifecycle; lifecycleNote?: { at: string; reason: string };
  setup: { state: SetupState; profilePresent: boolean; configuredFeedbackPoints: number };
  locations: Location[];
  commercial: Commercial;
  members: { active: number; suspended: number; revoked: number };
  timeline: AuditEvent[];
}

export interface MeasureResultFact { name: string; result: 'passed' | 'failed' | 'not_observed'; reason?: string }
export interface FeedbackPoint {
  id: string; orgId: string; name: string; location: string; publicRef: string;
  lifecycle: 'available' | 'unavailable' | 'establishing' | 'retired';
  createdAt: string; configId?: string; configVersion?: number;
  measures: MeasureResultFact[]; customQuestion: boolean;
  configReadiness: 'ready' | 'not_ready' | 'none'; configReason?: string;
  last: { session?: string; submission?: string; acceptance?: string; evidence?: string; signal?: string };
  window: { hours: number; sessions: number; submissions: number };
  evidenceCount: number;
  states: Record<Boundary, BoundaryState>;
  classification?: 'analytical_readiness_gap' | 'technical_failure';
  technicalFailure?: string; // exception type only, never a message
  integrityFindings?: string[];
  consumption?: { allowed: boolean; reason: string; basis: string };
  composition: string[]; // ids shown only under progressive disclosure
}

export interface Membership {
  id: string; userId: string; userName: string; orgId: string; status: 'active' | 'suspended' | 'revoked';
  createdAt: string; revokedAt?: string;
  bindings: { id: string; kind: string; createdAt: string; subject: string }[];
  roles: string[]; scopeLevels: string[]; scopeNames: string[]; evidenceClasses: string[];
  effective: { state: 'active' | 'inactive'; reason: string | null };
}

export type Severity = 'alert' | 'action_required' | 'informational' | 'unassigned';
export type AttentionCondition =
  | 'organisation_pending_admission' | 'commercial_capacity_exhausted'
  | 'feedback_point_configuration_not_ready' | 'analytical_readiness_gap'
  | 'acceptance_lineage_integrity_failure' | 'measure_result_technical_failure'
  | 'catalogue_integrity_failure';

// Condition -> governed class, copied from needs_attention.CONDITIONS.
export const CONDITIONS: Record<AttentionCondition, { severity: Severity; domain: string; label: string; basis: string; sourceFact: string }> = {
  organisation_pending_admission: { severity: 'action_required', domain: 'organisation_operations', label: 'Pending admission', basis: 'FOA-001 §14 action-required example: Organisation pending admission', sourceFact: 'Organisation has been established and is waiting for an operator admission decision.' },
  commercial_capacity_exhausted: { severity: 'unassigned', domain: 'commercial', label: 'Zero CU', basis: 'Zero CU is factual; no governed severity mapping or low-balance threshold exists', sourceFact: 'The commercial ledger balance is 0 or below.' },
  feedback_point_configuration_not_ready: { severity: 'action_required', domain: 'feedback_operations', label: 'Unusable Feedback Point configuration', basis: 'FOA-001 §14 action-required example: stuck Feedback Point setup', sourceFact: 'The effective configuration cannot be presented to a participant.' },
  analytical_readiness_gap: { severity: 'unassigned', domain: 'product_catalogue', label: 'Analytical readiness gap', basis: 'Governed-data readiness gap, not an operational failure; no governed severity', sourceFact: 'One or more Measures have no governed calculation mapping. The Feedback Point stays operational.' },
  acceptance_lineage_integrity_failure: { severity: 'unassigned', domain: 'feedback_operations', label: 'Lineage integrity', basis: 'Durable integrity finding on an accepted Submission; no governed severity', sourceFact: 'An accepted Submission has a commercial or Evidence lineage finding.' },
  measure_result_technical_failure: { severity: 'alert', domain: 'feedback_operations', label: 'Result technical failure', basis: 'FOA-001 §14 alert example: Result/Signal pipeline failure', sourceFact: 'The Measure Result calculation raised an unexpected exception when read.' },
  catalogue_integrity_failure: { severity: 'alert', domain: 'product_catalogue', label: 'Catalogue integrity', basis: 'FOA-001 §14 alert example: active catalogue integrity failure', sourceFact: 'The runtime catalogue disagrees with the repository Product source of truth.' },
};

export interface AttentionItem {
  id: string; condition: AttentionCondition; orgId?: string; fpId?: string;
  stateDetail: string; firstObserved: string; firstObservedBasis: string;
  evidence: Record<string, string>;
  action: { label: string; owner: string; permission: string; route: string };
}

export interface CatalogueMeasureRuntime { productId: string; runtimeStatus: 'draft' | 'active' | 'retired' }
export interface CatalogueConstruct {
  id: string; kind: string; name: string; status: 'draft' | 'active' | 'retired'; version?: string;
  origin: 'runtime-authored';
  usedBy: string; updated: string;
  gates: { name: string; satisfied: boolean; detail: string }[];
  retirementBlockers: { reference: string; count: number }[];
  permission: 'platform.catalogue.publish' | 'platform.catalogue.retire';
}
export interface CatalogueFinding { code: string; category: string; construct: string; detail: string; blocking: boolean }

export interface SettingEntry {
  key: string; name: string; cls: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; owner: string; effective: string;
  nature: 'governed_editable' | 'read_only' | 'provider_dependent' | 'unavailable' | 'withheld';
  why: string;
}
export interface Capability { id: string; name: string; state: 'implemented' | 'unavailable' | 'excluded' | 'blocked' | 'not_configured'; owner: string; reason: string; needs?: string }

export interface SupportContext {
  id: string; orgId: string; operator: string; reason: string; purpose: string;
  enteredAt: number; expiresAt: number; endedAt?: number;
}

// ---------------------------------------------------------------------------
// Operator identity and held permissions
// ---------------------------------------------------------------------------
export const ALL_PERMISSIONS = [
  'platform.organisation.directory.read', 'platform.organisation.detail.read',
  'platform.organisation.admission.read', 'platform.organisation.admission.admit',
  'platform.organisation.lifecycle.read', 'platform.organisation.lifecycle.suspend',
  'platform.organisation.lifecycle.reinstate', 'platform.organisation.lifecycle.close',
  'platform.commercial.account.read', 'platform.commercial.ledger.read',
  'platform.commercial.grant', 'platform.commercial.tier.change',
  'platform.feedback.directory.read', 'platform.feedback.detail.read', 'platform.feedback.diagnostic.read',
  'platform.access.directory.read', 'platform.access.detail.read', 'platform.access.identity.read',
  'platform.health.read', 'platform.attention.read',
  'platform.catalogue.read', 'platform.catalogue.validation.read',
  'platform.catalogue.publish', 'platform.catalogue.retire',
  'platform.settings.read', 'platform.support.context.enter', 'platform.support.context.read',
  'platform.audit.read',
] as const;
export type Permission = (typeof ALL_PERMISSIONS)[number];

export interface OperatorProfile { id: 'full' | 'readonly'; name: string; role: string; held: ReadonlySet<string> }
const READONLY_EXCLUDED = new Set<string>([
  'platform.organisation.admission.admit', 'platform.organisation.lifecycle.suspend',
  'platform.organisation.lifecycle.reinstate', 'platform.organisation.lifecycle.close',
  'platform.commercial.account.read', 'platform.commercial.ledger.read',
  'platform.commercial.grant', 'platform.commercial.tier.change',
  'platform.access.identity.read', 'platform.catalogue.publish', 'platform.catalogue.retire',
  'platform.support.context.enter',
]);
export const OPERATORS: OperatorProfile[] = [
  { id: 'full', name: 'Amara Okello', role: 'Fedoo platform operator', held: new Set(ALL_PERMISSIONS) },
  { id: 'readonly', name: 'Jonas Mbeki', role: 'Fedoo operator · read-only review set', held: new Set(ALL_PERMISSIONS.filter((p) => !READONLY_EXCLUDED.has(p))) },
];

// ---------------------------------------------------------------------------
// Organisations
// ---------------------------------------------------------------------------
const loc = (id: string, name: string, city: string): Location => ({ id, name, city });
const ledger = (rows: [string, string, number, string, string][]): LedgerEntry[] =>
  rows.map(([at, entryType, quantity, source, reason]) => ({ at, entryType, quantity, source, reason }));

export const ORGANISATIONS: Organisation[] = [
  {
    id: '3f6c1a52-8b1e-4c0a-9d51-0a7e4f2b9c11', name: 'Bubbles Café', country: 'Kenya', city: 'Nairobi', sector: 'Hospitality',
    timezone: 'Africa/Nairobi', adminContact: 'Wanjiru Kamau', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-03-11T08:02:00Z', admission: 'admitted', admissionProvenance: 'operator', admittedAt: '2026-03-12T10:30:00Z',
    lifecycle: 'operational', setup: { state: 'complete', profilePresent: true, configuredFeedbackPoints: 4 },
    locations: [loc('l1', 'Westlands', 'Nairobi'), loc('l2', 'Kilimani', 'Nairobi'), loc('l3', 'Karen', 'Nairobi')],
    commercial: {
      tier: 'premium', balance: 312, granted: 500, consumed: 188,
      complimentary: { entryType: 'signup_grant', quantity: 100, at: '2026-03-11T08:03:00Z' },
      ledger: ledger([['2026-09-18T07:55:00Z', 'operator_grant', 200, 'operator-commercial-operations', 'Premium onboarding pack'], ['2026-06-02T09:10:00Z', 'operator_grant', 200, 'operator-commercial-operations', 'Renewal pack'], ['2026-03-11T08:03:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [{ at: '2026-06-02T09:08:00Z', from: 'basic', to: 'premium', reason: 'Upgrade requested by the Organisation contact' }],
    },
    members: { active: 5, suspended: 0, revoked: 1 },
    timeline: [
      { at: '2026-09-18T07:55:00Z', action: 'platform.commercial.grant', result: 'allowed', reason: 'Premium onboarding pack', source: 'operator-commercial-operations', before: 'balance 112', after: 'balance 312' },
      { at: '2026-06-02T09:08:00Z', action: 'platform.commercial.tier.change', result: 'allowed', reason: 'Upgrade requested by the Organisation contact', source: 'operator-commercial-operations', before: 'basic', after: 'premium' },
      { at: '2026-03-12T10:30:00Z', action: 'platform.organisation.admission.admit', result: 'allowed', reason: 'Profile reviewed; sector confirmed', source: 'operator-organisation-operations', before: 'pending', after: 'admitted' },
    ],
  },
  {
    id: '9a2d77e0-51c4-4f0b-8e36-6b1d0c3a7f22', name: 'The Corner Bistro', country: 'Rwanda', city: 'Kigali', sector: 'Hospitality',
    timezone: 'Africa/Kigali', adminContact: 'Eric Habimana', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-05-20T13:40:00Z', admission: 'admitted', admissionProvenance: 'operator', admittedAt: '2026-05-21T08:15:00Z',
    lifecycle: 'operational', setup: { state: 'complete', profilePresent: true, configuredFeedbackPoints: 1 },
    locations: [loc('l1', 'Kimihurura', 'Kigali')],
    commercial: {
      tier: 'basic', balance: 1, granted: 100, consumed: 99,
      complimentary: { entryType: 'signup_grant', quantity: 100, at: '2026-05-20T13:41:00Z' },
      ledger: ledger([['2026-05-20T13:41:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [],
    },
    members: { active: 2, suspended: 0, revoked: 0 },
    timeline: [{ at: '2026-05-21T08:15:00Z', action: 'platform.organisation.admission.admit', result: 'allowed', reason: 'Profile reviewed', source: 'operator-organisation-operations', before: 'pending', after: 'admitted' }],
  },
  {
    id: 'c41b9e08-2d6a-4a73-b5f9-1e8a52d04b33', name: 'Lakeview Dental Clinic', country: 'Uganda', city: 'Kampala', sector: 'Healthcare',
    timezone: 'Africa/Kampala', adminContact: 'Dr. Grace Nansubuga', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-09-30T14:21:00Z', admission: 'pending', admissionProvenance: 'self-registration',
    lifecycle: 'operational', setup: { state: 'incomplete', profilePresent: true, configuredFeedbackPoints: 0 },
    locations: [loc('l1', 'Kololo', 'Kampala')],
    commercial: {
      tier: 'basic', balance: 100, granted: 100, consumed: 0,
      complimentary: { entryType: 'signup_grant', quantity: 100, at: '2026-09-30T14:22:00Z' },
      ledger: ledger([['2026-09-30T14:22:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [],
    },
    members: { active: 1, suspended: 0, revoked: 0 }, timeline: [],
  },
  {
    id: 'e7d03c19-6f8b-4e21-a0c4-9b35f7a1d644', name: 'Savannah Salon & Spa', country: 'Kenya', city: 'Nairobi', sector: 'Beauty & personal care',
    timezone: 'Africa/Nairobi', adminContact: 'Aisha Mwangi', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-07-04T09:30:00Z', admission: 'admitted', admissionProvenance: 'operator', admittedAt: '2026-07-05T11:00:00Z',
    lifecycle: 'operational', setup: { state: 'complete', profilePresent: true, configuredFeedbackPoints: 2 },
    locations: [loc('l1', 'Lavington', 'Nairobi')],
    commercial: {
      tier: 'basic', balance: 0, granted: 100, consumed: 100,
      complimentary: { entryType: 'signup_grant', quantity: 100, at: '2026-07-04T09:31:00Z' },
      ledger: ledger([['2026-09-27T16:48:00Z', 'consumption', -1, 'product-acceptance', 'Accepted Submission'], ['2026-07-04T09:31:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [],
    },
    members: { active: 3, suspended: 1, revoked: 0 },
    timeline: [{ at: '2026-07-05T11:00:00Z', action: 'platform.organisation.admission.admit', result: 'allowed', reason: 'Profile reviewed', source: 'operator-organisation-operations', before: 'pending', after: 'admitted' }],
  },
  {
    id: '58b0a6d3-7e14-49c5-96aa-d2f81c0e3755', name: 'Nairobi Fresh Mart', country: 'Kenya', city: 'Nairobi', sector: 'Retail',
    timezone: 'Africa/Nairobi', adminContact: 'Peter Otieno', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-04-08T10:12:00Z', admission: 'admitted', admissionProvenance: 'operator', admittedAt: '2026-04-09T09:00:00Z',
    lifecycle: 'suspended', lifecycleNote: { at: '2026-09-21T12:05:00Z', reason: 'Billing dispute under review' },
    setup: { state: 'complete', profilePresent: true, configuredFeedbackPoints: 2 },
    locations: [loc('l1', 'Westlands', 'Nairobi'), loc('l2', 'Eastleigh', 'Nairobi')],
    commercial: {
      tier: 'premium', balance: 120, granted: 300, consumed: 180,
      ledger: ledger([['2026-04-09T09:05:00Z', 'operator_grant', 200, 'operator-commercial-operations', 'Premium pack'], ['2026-04-08T10:13:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [{ at: '2026-04-09T09:04:00Z', from: 'basic', to: 'premium', reason: 'Contracted tier' }],
    },
    members: { active: 4, suspended: 0, revoked: 0 },
    timeline: [
      { at: '2026-09-21T12:05:00Z', action: 'platform.organisation.lifecycle.suspend', result: 'allowed', reason: 'Billing dispute under review', source: 'operator-organisation-operations', before: 'operational', after: 'suspended' },
      { at: '2026-04-09T09:00:00Z', action: 'platform.organisation.admission.admit', result: 'allowed', reason: 'Profile reviewed', source: 'operator-organisation-operations', before: 'pending', after: 'admitted' },
    ],
  },
  {
    id: 'a1f4e8c6-3b92-4d07-8c5e-7f60b9d12a66', name: 'Kigali Heights Hotel', country: 'Rwanda', city: 'Kigali', sector: 'Hotels & lodging',
    timezone: 'Africa/Kigali', adminContact: 'Claudine Uwase', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-02-16T07:45:00Z', admission: 'admitted', admissionProvenance: 'operator', admittedAt: '2026-02-17T09:20:00Z',
    lifecycle: 'operational', setup: { state: 'complete', profilePresent: true, configuredFeedbackPoints: 3 },
    locations: [loc('l1', 'Main building', 'Kigali'), loc('l2', 'Garden wing', 'Kigali')],
    commercial: {
      tier: 'premium', balance: 540, granted: 800, consumed: 260,
      ledger: ledger([['2026-08-10T08:00:00Z', 'operator_grant', 300, 'operator-commercial-operations', 'Quarterly pack'], ['2026-02-17T09:30:00Z', 'operator_grant', 400, 'operator-commercial-operations', 'Premium pack'], ['2026-02-16T07:46:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [{ at: '2026-02-17T09:28:00Z', from: 'basic', to: 'premium', reason: 'Contracted tier' }],
    },
    members: { active: 6, suspended: 0, revoked: 2 },
    timeline: [{ at: '2026-08-10T08:00:00Z', action: 'platform.commercial.grant', result: 'allowed', reason: 'Quarterly pack', source: 'operator-commercial-operations', before: 'balance 240', after: 'balance 540' }],
  },
  {
    id: 'd29e5b70-4a68-4c13-b7f2-0c91e63a8d77', name: 'Umoja Pharmacy', country: 'Tanzania', city: 'Dar es Salaam', sector: 'Healthcare',
    timezone: 'Africa/Dar_es_Salaam', adminContact: 'Neema Mushi', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-08-22T11:05:00Z', admission: 'admitted', admissionProvenance: 'operator', admittedAt: '2026-08-23T08:40:00Z',
    lifecycle: 'operational', setup: { state: 'complete', profilePresent: true, configuredFeedbackPoints: 1 },
    locations: [loc('l1', 'Mikocheni', 'Dar es Salaam')],
    commercial: {
      tier: 'basic', balance: 100, granted: 100, consumed: 0,
      complimentary: { entryType: 'signup_grant', quantity: 100, at: '2026-08-22T11:06:00Z' },
      ledger: ledger([['2026-08-22T11:06:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [],
    },
    members: { active: 2, suspended: 0, revoked: 0 },
    timeline: [{ at: '2026-08-23T08:40:00Z', action: 'platform.organisation.admission.admit', result: 'allowed', reason: 'Profile reviewed', source: 'operator-organisation-operations', before: 'pending', after: 'admitted' }],
  },
  {
    id: 'b6c3d1f4-9e05-4b82-a7d8-3e24f0a95b88', name: 'Harbour View Restaurant', country: 'Kenya', city: 'Mombasa', sector: 'Hospitality',
    timezone: 'Africa/Nairobi', adminContact: 'Salim Bakari', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-06-14T12:00:00Z', admission: 'admitted', admissionProvenance: 'operator', admittedAt: '2026-06-15T09:10:00Z',
    lifecycle: 'operational', setup: { state: 'complete', profilePresent: true, configuredFeedbackPoints: 1 },
    locations: [loc('l1', 'Nyali', 'Mombasa')],
    commercial: {
      tier: 'basic', balance: 74, granted: 100, consumed: 26,
      complimentary: { entryType: 'signup_grant', quantity: 100, at: '2026-06-14T12:01:00Z' },
      ledger: ledger([['2026-06-14T12:01:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [],
    },
    members: { active: 2, suspended: 0, revoked: 0 },
    timeline: [{ at: '2026-06-15T09:10:00Z', action: 'platform.organisation.admission.admit', result: 'allowed', reason: 'Profile reviewed', source: 'operator-organisation-operations', before: 'pending', after: 'admitted' }],
  },
  {
    id: '0d7a2e95-c8b1-4f36-9a40-5b13e8c6d299', name: 'Coast Auto Spares', country: 'Kenya', city: 'Mombasa', sector: 'Retail',
    timezone: 'Africa/Nairobi', adminContact: 'Hassan Juma', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-05-02T08:20:00Z', admission: 'admitted', admissionProvenance: 'operator', admittedAt: '2026-05-03T10:00:00Z',
    lifecycle: 'operational', setup: { state: 'complete', profilePresent: true, configuredFeedbackPoints: 1 },
    locations: [loc('l1', 'Changamwe', 'Mombasa')],
    commercial: {
      tier: 'premium', balance: 260, granted: 300, consumed: 40,
      ledger: ledger([['2026-05-03T10:05:00Z', 'operator_grant', 200, 'operator-commercial-operations', 'Premium pack'], ['2026-05-02T08:21:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [{ at: '2026-05-03T10:04:00Z', from: 'basic', to: 'premium', reason: 'Contracted tier' }],
    },
    members: { active: 3, suspended: 0, revoked: 0 },
    timeline: [{ at: '2026-05-03T10:00:00Z', action: 'platform.organisation.admission.admit', result: 'allowed', reason: 'Profile reviewed', source: 'operator-organisation-operations', before: 'pending', after: 'admitted' }],
  },
  {
    id: '71e8f2a0-d5c3-4b69-8f17-a4062d9e5b00', name: 'Old Town Barbers', country: 'Kenya', city: 'Mombasa', sector: 'Beauty & personal care',
    timezone: 'Africa/Nairobi', adminContact: 'Juma Said', adminLanguage: 'English', feedbackLanguages: ['English'],
    establishedAt: '2026-01-19T09:00:00Z', admission: 'admitted', admissionProvenance: 'operator', admittedAt: '2026-01-20T09:00:00Z',
    lifecycle: 'closed', lifecycleNote: { at: '2026-08-30T15:30:00Z', reason: 'Business ceased trading; closure requested by contact' },
    setup: { state: 'complete', profilePresent: true, configuredFeedbackPoints: 1 },
    locations: [loc('l1', 'Old Town', 'Mombasa')],
    commercial: {
      tier: 'basic', balance: 38, granted: 100, consumed: 62,
      ledger: ledger([['2026-01-19T09:01:00Z', 'signup_grant', 100, 'registration', 'Complimentary signup grant']]),
      tierHistory: [],
    },
    members: { active: 0, suspended: 0, revoked: 1 },
    timeline: [{ at: '2026-08-30T15:30:00Z', action: 'platform.organisation.lifecycle.close', result: 'allowed', reason: 'Business ceased trading; closure requested by contact', source: 'operator-organisation-operations', before: 'operational', after: 'closed' }],
  },
];

// ---------------------------------------------------------------------------
// Feedback Points
// ---------------------------------------------------------------------------
const OK: Record<Boundary, BoundaryState> = {
  public_ref: 'passed', endpoint: 'passed', configuration: 'passed', session: 'passed', submission: 'passed',
  acceptance: 'passed', evidence: 'passed', result: 'passed', signal: 'passed',
};
const states = (over: Partial<Record<Boundary, BoundaryState>>): Record<Boundary, BoundaryState> => ({ ...OK, ...over });
const m5 = (extra?: Partial<MeasureResultFact>[]): MeasureResultFact[] =>
  ['Overall Experience', 'Speed of Service', 'Staff Courtesy', 'Ease of Service', 'Likelihood to Return']
    .map((name, i) => ({ name, result: 'passed' as const, ...(extra?.[i] ?? {}) }));
const comp = (n: number) => Array.from({ length: n }, (_, i) => `qv-${(1000 + i * 37).toString(16)}`);
const base = { custom: false };

export const FEEDBACK_POINTS: FeedbackPoint[] = [
  { id: 'fp-b1', orgId: ORGANISATIONS[0].id, name: 'Counter — Westlands', location: 'Westlands', publicRef: 'bub-wl-counter', lifecycle: 'available', createdAt: '2026-03-14T09:00:00Z', configId: 'cfg-b1-v3', configVersion: 3, measures: m5(), customQuestion: true, configReadiness: 'ready', last: { session: '2026-10-02T08:57:00Z', submission: '2026-10-02T08:58:00Z', acceptance: '2026-10-02T08:58:00Z', evidence: '2026-10-02T08:58:00Z', signal: '2026-10-02T08:58:00Z' }, window: { hours: 168, sessions: 142, submissions: 118 }, evidenceCount: 590, states: states({}), composition: comp(6) },
  { id: 'fp-b2', orgId: ORGANISATIONS[0].id, name: 'Table QR — Westlands', location: 'Westlands', publicRef: 'bub-wl-tables', lifecycle: 'available', createdAt: '2026-03-14T09:20:00Z', configId: 'cfg-b2-v2', configVersion: 2, measures: m5(), customQuestion: false, configReadiness: 'ready', last: { session: '2026-10-02T09:02:00Z', submission: '2026-10-02T09:03:00Z', acceptance: '2026-10-02T09:03:00Z', evidence: '2026-10-02T09:03:00Z', signal: '2026-10-02T09:03:00Z' }, window: { hours: 168, sessions: 96, submissions: 80 }, evidenceCount: 402, states: states({}), composition: comp(5) },
  { id: 'fp-b3', orgId: ORGANISATIONS[0].id, name: 'Counter — Kilimani', location: 'Kilimani', publicRef: 'bub-kl-counter', lifecycle: 'available', createdAt: '2026-04-02T10:00:00Z', configId: 'cfg-b3-v1', configVersion: 1, measures: m5(), customQuestion: false, configReadiness: 'ready', last: { session: '2026-10-02T07:40:00Z', submission: '2026-10-02T07:41:00Z', acceptance: '2026-10-02T07:41:00Z', evidence: '2026-10-02T07:41:00Z', signal: '2026-10-02T07:41:00Z' }, window: { hours: 168, sessions: 61, submissions: 52 }, evidenceCount: 261, states: states({}), composition: comp(5) },
  { id: 'fp-b4', orgId: ORGANISATIONS[0].id, name: 'Takeaway — Karen', location: 'Karen', publicRef: 'bub-kn-takeaway', lifecycle: 'available', createdAt: '2026-09-30T11:00:00Z', configId: 'cfg-b4-v1', configVersion: 1, measures: m5().map((m) => ({ ...m, result: 'not_observed' as const })), customQuestion: false, configReadiness: 'ready', last: {}, window: { hours: 168, sessions: 0, submissions: 0 }, evidenceCount: 0, states: states({ session: 'not_observed', submission: 'not_observed', acceptance: 'not_observed', evidence: 'not_observed', result: 'not_observed', signal: 'not_observed' }), composition: comp(5) },
  { id: 'fp-c1', orgId: ORGANISATIONS[1].id, name: 'Front Counter', location: 'Kimihurura', publicRef: 'cb-front', lifecycle: 'available', createdAt: '2026-05-22T09:00:00Z', configId: 'cfg-c1-v1', configVersion: 1, measures: m5(), customQuestion: false, configReadiness: 'ready', last: { session: '2026-10-02T08:10:00Z', submission: '2026-10-02T08:11:00Z', acceptance: '2026-10-02T08:11:00Z', evidence: '2026-10-02T08:11:00Z', signal: '2026-10-02T08:11:00Z' }, window: { hours: 168, sessions: 88, submissions: 71 }, evidenceCount: 355, states: states({}), composition: comp(5) },
  { id: 'fp-l1', orgId: ORGANISATIONS[2].id, name: 'Reception', location: 'Kololo', publicRef: 'lakeview-reception', lifecycle: 'available', createdAt: '2026-09-30T14:40:00Z', measures: [], customQuestion: false, configReadiness: 'none', last: {}, window: { hours: 168, sessions: 0, submissions: 0 }, evidenceCount: 0, states: states({ configuration: 'not_observed', session: 'not_observed', submission: 'not_observed', acceptance: 'not_observed', evidence: 'not_observed', result: 'not_observed', signal: 'not_observed' }), composition: [] },
  { id: 'fp-s1', orgId: ORGANISATIONS[3].id, name: 'Reception Desk', location: 'Lavington', publicRef: 'sav-reception', lifecycle: 'available', createdAt: '2026-07-06T09:00:00Z', configId: 'cfg-s1-v1', configVersion: 1, measures: m5(), customQuestion: false, configReadiness: 'ready', last: { session: '2026-09-27T16:40:00Z', submission: '2026-09-27T16:47:00Z', acceptance: '2026-09-27T16:48:00Z', evidence: '2026-09-27T16:48:00Z', signal: '2026-09-27T16:48:00Z' }, window: { hours: 168, sessions: 9, submissions: 9 }, evidenceCount: 500, states: states({}), composition: comp(5) },
  { id: 'fp-s2', orgId: ORGANISATIONS[3].id, name: 'Treatment Room 2', location: 'Lavington', publicRef: 'sav-room2', lifecycle: 'available', createdAt: '2026-09-28T10:00:00Z', configId: 'cfg-s2-v1', configVersion: 1, measures: m5().map((m) => ({ ...m, result: 'not_observed' as const })), customQuestion: false, configReadiness: 'ready', last: { session: '2026-10-01T15:22:00Z', submission: '2026-10-01T15:25:00Z' }, window: { hours: 168, sessions: 14, submissions: 11 }, evidenceCount: 0, states: states({ acceptance: 'not_observed', evidence: 'not_observed', result: 'not_observed', signal: 'not_observed' }), composition: comp(5) },
  { id: 'fp-n1', orgId: ORGANISATIONS[4].id, name: 'Checkout 1', location: 'Westlands', publicRef: 'nfm-co1', lifecycle: 'available', createdAt: '2026-04-10T09:00:00Z', configId: 'cfg-n1-v2', configVersion: 2, measures: m5(), customQuestion: true, configReadiness: 'ready', last: { session: '2026-09-20T17:30:00Z', submission: '2026-09-20T17:31:00Z', acceptance: '2026-09-20T17:31:00Z', evidence: '2026-09-20T17:31:00Z', signal: '2026-09-20T17:31:00Z' }, window: { hours: 168, sessions: 0, submissions: 0 }, evidenceCount: 740, states: states({ session: 'not_observed', submission: 'not_observed', acceptance: 'not_observed', evidence: 'not_observed', result: 'not_observed', signal: 'not_observed' }), composition: comp(6) },
  { id: 'fp-n2', orgId: ORGANISATIONS[4].id, name: 'Checkout 2', location: 'Eastleigh', publicRef: 'nfm-co2', lifecycle: 'unavailable', createdAt: '2026-04-10T09:30:00Z', configId: 'cfg-n2-v1', configVersion: 1, measures: m5().map((m) => ({ ...m, result: 'not_observed' as const })), customQuestion: false, configReadiness: 'ready', last: { session: '2026-09-18T11:00:00Z', submission: '2026-09-18T11:01:00Z', acceptance: '2026-09-18T11:01:00Z', evidence: '2026-09-18T11:01:00Z', signal: '2026-09-18T11:01:00Z' }, window: { hours: 168, sessions: 0, submissions: 0 }, evidenceCount: 211, states: states({ endpoint: 'failed', session: 'not_observed', submission: 'not_observed', acceptance: 'not_observed', evidence: 'not_observed', result: 'not_observed', signal: 'not_observed' }), composition: comp(5) },
  { id: 'fp-k1', orgId: ORGANISATIONS[5].id, name: 'Front Desk', location: 'Main building', publicRef: 'kh-front', lifecycle: 'available', createdAt: '2026-02-20T09:00:00Z', configId: 'cfg-k1-v4', configVersion: 4, measures: m5(), customQuestion: true, configReadiness: 'ready', last: { session: '2026-10-02T06:20:00Z', submission: '2026-10-02T06:22:00Z', acceptance: '2026-10-02T06:22:00Z', evidence: '2026-10-02T06:22:00Z', signal: '2026-10-02T06:22:00Z' }, window: { hours: 168, sessions: 120, submissions: 97 }, evidenceCount: 1210, states: states({}), composition: comp(6) },
  { id: 'fp-k2', orgId: ORGANISATIONS[5].id, name: 'Restaurant', location: 'Garden wing', publicRef: 'kh-resto', lifecycle: 'available', createdAt: '2026-03-02T09:00:00Z', configId: 'cfg-k2-v2', configVersion: 2, measures: [{ name: 'Overall Experience', result: 'passed' }, { name: 'Food & Beverage Quality', result: 'failed', reason: 'calculation_rule_unavailable' }, { name: 'Speed of Service', result: 'passed' }, { name: 'Fairness of Treatment', result: 'failed', reason: 'band_map_unavailable' }, { name: 'Likelihood to Recommend', result: 'passed' }], customQuestion: false, configReadiness: 'ready', last: { session: '2026-10-02T07:50:00Z', submission: '2026-10-02T07:52:00Z', acceptance: '2026-10-02T07:52:00Z', evidence: '2026-10-02T07:52:00Z', signal: '2026-10-02T07:52:00Z' }, window: { hours: 168, sessions: 74, submissions: 63 }, evidenceCount: 690, states: states({ result: 'failed', signal: 'unknown' }), classification: 'analytical_readiness_gap', composition: comp(5) },
  { id: 'fp-k3', orgId: ORGANISATIONS[5].id, name: 'Spa Reception', location: 'Garden wing', publicRef: 'kh-spa', lifecycle: 'available', createdAt: '2026-03-02T09:30:00Z', configId: 'cfg-k3-v1', configVersion: 1, measures: m5(), customQuestion: false, configReadiness: 'ready', last: { session: '2026-10-01T18:05:00Z', submission: '2026-10-01T18:06:00Z', acceptance: '2026-10-01T18:06:00Z', evidence: '2026-10-01T18:06:00Z', signal: '2026-10-01T18:06:00Z' }, window: { hours: 168, sessions: 31, submissions: 25 }, evidenceCount: 301, states: states({}), composition: comp(5) },
  { id: 'fp-u1', orgId: ORGANISATIONS[6].id, name: 'Pharmacy Counter', location: 'Mikocheni', publicRef: 'umoja-counter', lifecycle: 'available', createdAt: '2026-08-24T09:00:00Z', configId: 'cfg-u1-v1', configVersion: 1, measures: m5().map((m) => ({ ...m, result: 'not_observed' as const })), customQuestion: false, configReadiness: 'not_ready', configReason: 'question_version_unresolvable', last: {}, window: { hours: 168, sessions: 0, submissions: 0 }, evidenceCount: 0, states: states({ configuration: 'failed', session: 'not_observed', submission: 'not_observed', acceptance: 'not_observed', evidence: 'not_observed', result: 'not_observed', signal: 'not_observed' }), composition: comp(5) },
  { id: 'fp-h1', orgId: ORGANISATIONS[7].id, name: 'Terrace', location: 'Nyali', publicRef: 'hv-terrace', lifecycle: 'available', createdAt: '2026-06-16T09:00:00Z', configId: 'cfg-h1-v1', configVersion: 1, measures: m5(), customQuestion: false, configReadiness: 'ready', last: { session: '2026-10-01T19:10:00Z', submission: '2026-10-01T19:12:00Z', acceptance: '2026-10-01T19:12:00Z', evidence: '2026-10-01T19:12:00Z', signal: '2026-10-01T19:12:00Z' }, window: { hours: 168, sessions: 38, submissions: 30 }, evidenceCount: 148, states: states({ acceptance: 'failed' }), integrityFindings: ['evidence_count_differs_from_answered_count'], consumption: { allowed: true, reason: 'commercial_capacity_available', basis: 'commercial_balance' }, composition: comp(5) },
  { id: 'fp-a1', orgId: ORGANISATIONS[8].id, name: 'Parts Counter', location: 'Changamwe', publicRef: 'cas-counter', lifecycle: 'available', createdAt: '2026-05-05T09:00:00Z', configId: 'cfg-a1-v2', configVersion: 2, measures: [], customQuestion: false, configReadiness: 'ready', last: { session: '2026-10-02T08:30:00Z', submission: '2026-10-02T08:31:00Z', acceptance: '2026-10-02T08:31:00Z', evidence: '2026-10-02T08:31:00Z', signal: '2026-09-29T10:00:00Z' }, window: { hours: 168, sessions: 33, submissions: 28 }, evidenceCount: 215, states: states({ result: 'failed', signal: 'unknown' }), classification: 'technical_failure', technicalFailure: 'KeyError', composition: comp(5) },
  { id: 'fp-o1', orgId: ORGANISATIONS[9].id, name: 'Shop Door', location: 'Old Town', publicRef: 'otb-door', lifecycle: 'retired', createdAt: '2026-01-21T09:00:00Z', configId: 'cfg-o1-v1', configVersion: 1, measures: m5().map((m) => ({ ...m, result: 'not_observed' as const })), customQuestion: false, configReadiness: 'ready', last: { session: '2026-08-29T13:00:00Z', submission: '2026-08-29T13:01:00Z', acceptance: '2026-08-29T13:01:00Z', evidence: '2026-08-29T13:01:00Z', signal: '2026-08-29T13:01:00Z' }, window: { hours: 168, sessions: 0, submissions: 0 }, evidenceCount: 310, states: states({ endpoint: 'failed', session: 'not_observed', submission: 'not_observed', acceptance: 'not_observed', evidence: 'not_observed', result: 'not_observed', signal: 'not_observed' }), composition: comp(5) },
];
void base;

// ---------------------------------------------------------------------------
// Users & Access (one row per membership)
// ---------------------------------------------------------------------------
const bind = (id: string, kind: string, at: string, subject: string) => ({ id, kind, createdAt: at, subject });
export const MEMBERSHIPS: Membership[] = [
  { id: 'mem-01', userId: 'u-01', userName: 'Wanjiru Kamau', orgId: ORGANISATIONS[0].id, status: 'active', createdAt: '2026-03-11T08:02:00Z', bindings: [bind('b-01', 'email-password (dev)', '2026-03-11T08:02:00Z', 'dev|wanjiru.kamau')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['Bubbles Café (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-02', userId: 'u-02', userName: 'Daniel Njoroge', orgId: ORGANISATIONS[0].id, status: 'active', createdAt: '2026-03-20T09:12:00Z', bindings: [bind('b-02', 'email-password (dev)', '2026-03-20T09:12:00Z', 'dev|daniel.njoroge')], roles: ['viewer'], scopeLevels: ['location'], scopeNames: ['Westlands'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-03', userId: 'u-03', userName: 'Faith Achieng', orgId: ORGANISATIONS[0].id, status: 'revoked', createdAt: '2026-04-02T10:40:00Z', revokedAt: '2026-08-14T13:00:00Z', bindings: [bind('b-03', 'email-password (dev)', '2026-04-02T10:40:00Z', 'dev|faith.achieng')], roles: ['viewer'], scopeLevels: ['location'], scopeNames: ['Kilimani'], evidenceClasses: ['standard'], effective: { state: 'inactive', reason: 'membership_not_active' } },
  { id: 'mem-04', userId: 'u-04', userName: 'Eric Habimana', orgId: ORGANISATIONS[1].id, status: 'active', createdAt: '2026-05-20T13:40:00Z', bindings: [bind('b-04', 'email-password (dev)', '2026-05-20T13:40:00Z', 'dev|eric.habimana')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['The Corner Bistro (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-05', userId: 'u-05', userName: 'Dr. Grace Nansubuga', orgId: ORGANISATIONS[2].id, status: 'active', createdAt: '2026-09-30T14:21:00Z', bindings: [bind('b-05', 'email-password (dev)', '2026-09-30T14:21:00Z', 'dev|grace.nansubuga')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['Lakeview Dental Clinic (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-06', userId: 'u-06', userName: 'Aisha Mwangi', orgId: ORGANISATIONS[3].id, status: 'active', createdAt: '2026-07-04T09:30:00Z', bindings: [bind('b-06', 'email-password (dev)', '2026-07-04T09:30:00Z', 'dev|aisha.mwangi')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['Savannah Salon & Spa (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-07', userId: 'u-07', userName: 'Brian Ouma', orgId: ORGANISATIONS[3].id, status: 'suspended', createdAt: '2026-07-20T10:00:00Z', bindings: [bind('b-07', 'email-password (dev)', '2026-07-20T10:00:00Z', 'dev|brian.ouma')], roles: ['viewer'], scopeLevels: ['location'], scopeNames: ['Lavington'], evidenceClasses: ['standard'], effective: { state: 'inactive', reason: 'membership_not_active' } },
  { id: 'mem-08', userId: 'u-08', userName: 'Peter Otieno', orgId: ORGANISATIONS[4].id, status: 'active', createdAt: '2026-04-08T10:12:00Z', bindings: [bind('b-08', 'email-password (dev)', '2026-04-08T10:12:00Z', 'dev|peter.otieno')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['Nairobi Fresh Mart (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-09', userId: 'u-09', userName: 'Claudine Uwase', orgId: ORGANISATIONS[5].id, status: 'active', createdAt: '2026-02-16T07:45:00Z', bindings: [bind('b-09', 'email-password (dev)', '2026-02-16T07:45:00Z', 'dev|claudine.uwase')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['Kigali Heights Hotel (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-10', userId: 'u-10', userName: 'Olivier Ndayisaba', orgId: ORGANISATIONS[5].id, status: 'active', createdAt: '2026-03-03T12:00:00Z', bindings: [], roles: ['viewer'], scopeLevels: ['location'], scopeNames: ['Garden wing'], evidenceClasses: ['standard'], effective: { state: 'inactive', reason: 'role_scope_or_evidence_class_assignment_missing' } },
  { id: 'mem-11', userId: 'u-11', userName: 'Neema Mushi', orgId: ORGANISATIONS[6].id, status: 'active', createdAt: '2026-08-22T11:05:00Z', bindings: [bind('b-11', 'email-password (dev)', '2026-08-22T11:05:00Z', 'dev|neema.mushi')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['Umoja Pharmacy (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-12', userId: 'u-12', userName: 'Salim Bakari', orgId: ORGANISATIONS[7].id, status: 'active', createdAt: '2026-06-14T12:00:00Z', bindings: [bind('b-12', 'email-password (dev)', '2026-06-14T12:00:00Z', 'dev|salim.bakari')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['Harbour View Restaurant (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-13', userId: 'u-13', userName: 'Hassan Juma', orgId: ORGANISATIONS[8].id, status: 'active', createdAt: '2026-05-02T08:20:00Z', bindings: [bind('b-13', 'email-password (dev)', '2026-05-02T08:20:00Z', 'dev|hassan.juma')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['Coast Auto Spares (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'active', reason: null } },
  { id: 'mem-14', userId: 'u-14', userName: 'Juma Said', orgId: ORGANISATIONS[9].id, status: 'revoked', createdAt: '2026-01-19T09:00:00Z', revokedAt: '2026-08-30T15:31:00Z', bindings: [bind('b-14', 'email-password (dev)', '2026-01-19T09:00:00Z', 'dev|juma.said')], roles: ['admin'], scopeLevels: ['organisation'], scopeNames: ['Old Town Barbers (all Locations)'], evidenceClasses: ['standard'], effective: { state: 'inactive', reason: 'membership_not_active' } },
];

export const DEFERRED_ACCESS_COMMANDS: Record<string, string> = {
  'Suspend / restore / revoke membership': 'No governed transition semantics or persistence writer exists yet.',
  'Change role': 'The final customer role vocabulary is not governed; stored names are WP-01 foundation fixtures.',
  'Change scope': 'No governed scope-change rules or owning service.',
  'Change Evidence Class': 'No governed Evidence Class change rules or owning service.',
  'Invite / re-invite': 'No invitation state, delivery provider, credential or expiry model.',
  'Provider recovery': 'The current adapter exposes only kind and provider subject; no recovery primitive.',
  'Ownership transfer': 'No governed definition of owner, proof threshold or transfer state machine.',
};

// ---------------------------------------------------------------------------
// Needs Attention (derived from the state above; severity = governed class only)
// ---------------------------------------------------------------------------
const org = (i: number) => ORGANISATIONS[i];
export const ATTENTION: AttentionItem[] = [
  { id: 'att-1', condition: 'measure_result_technical_failure', orgId: org(8).id, fpId: 'fp-a1', stateDetail: 'Result calculation raised KeyError when read (exception type only; message withheld).', firstObserved: '2026-10-02T09:14:00Z', firstObservedBasis: 'Live read; no durable failure history exists, so first-observed equals this read.', evidence: { exception_type: 'KeyError', measures_evaluated: '5', window: '168h' }, action: { label: 'Open Feedback Point diagnostic', owner: 'feedback_operations', permission: 'platform.feedback.diagnostic.read', route: '/console/feedback/fp-a1' } },
  { id: 'att-2', condition: 'organisation_pending_admission', orgId: org(2).id, stateDetail: 'Admission is pending; established 2 days ago by self-registration.', firstObserved: '2026-09-30T14:21:00Z', firstObservedBasis: 'Organisation establishment time', evidence: { admission: 'pending', provenance: 'self-registration', setup: 'incomplete' }, action: { label: 'Admit Organisation…', owner: 'organisation_operations', permission: 'platform.organisation.admission.admit', route: '/console/organisations/' + org(2).id + '?tab=admission' } },
  { id: 'att-3', condition: 'feedback_point_configuration_not_ready', orgId: org(6).id, fpId: 'fp-u1', stateDetail: 'Effective configuration v1 cannot be resolved for a participant (question_version_unresolvable).', firstObserved: '2026-08-24T09:00:00Z', firstObservedBasis: 'Feedback Point establishment time', evidence: { configuration: 'cfg-u1-v1', reason: 'question_version_unresolvable' }, action: { label: 'Open Feedback Point diagnostic', owner: 'feedback_operations', permission: 'platform.feedback.diagnostic.read', route: '/console/feedback/fp-u1' } },
  { id: 'att-4', condition: 'catalogue_integrity_failure', stateDetail: 'Standard Question “Staff Courtesy” has more than one active Question Version (multiple_active_question_versions).', firstObserved: '2026-10-02T09:14:00Z', firstObservedBasis: 'Live read of the runtime catalogue', evidence: { finding: 'multiple_active_question_versions', construct: 'question_version' }, action: { label: 'Open catalogue diagnostics', owner: 'product_catalogue', permission: 'platform.catalogue.validation.read', route: '/console/catalogue?view=diagnostics' } },
  { id: 'att-5', condition: 'commercial_capacity_exhausted', orgId: org(3).id, stateDetail: 'Balance is 0 CU since 2026-09-27.', firstObserved: '2026-09-27T16:48:00Z', firstObservedBasis: 'Effective time of the ledger entry that took the balance to 0', evidence: { balance: '0 CU', tier: 'basic' }, action: { label: 'Grant CU pack…', owner: 'commercial', permission: 'platform.commercial.grant', route: '/console/organisations/' + org(3).id + '?tab=commercial' } },
  { id: 'att-6', condition: 'acceptance_lineage_integrity_failure', orgId: org(7).id, fpId: 'fp-h1', stateDetail: '1 accepted Submission: evidence_count_differs_from_answered_count.', firstObserved: '2026-10-01T19:12:00Z', firstObservedBasis: 'Acceptance time of the affected Submission', evidence: { finding: 'evidence_count_differs_from_answered_count', affected_submissions: '1' }, action: { label: 'Open Feedback Point diagnostic', owner: 'feedback_operations', permission: 'platform.feedback.diagnostic.read', route: '/console/feedback/fp-h1' } },
  { id: 'att-7', condition: 'analytical_readiness_gap', orgId: org(5).id, fpId: 'fp-k2', stateDetail: '2 of 5 Measures have no governed calculation mapping. The Feedback Point stays operational.', firstObserved: '2026-10-02T09:14:00Z', firstObservedBasis: 'Live read; the gap is a property of governed data', evidence: { measures_without_governed_band: '2', categories: 'calculation_rule_unavailable, band_map_unavailable' }, action: { label: 'Open catalogue readiness', owner: 'product_catalogue', permission: 'platform.catalogue.read', route: '/console/catalogue?view=readiness' } },
];

// ---------------------------------------------------------------------------
// Product / Catalogue (runtime-authored constructs; the canonical 88 live in canonicalCatalogue.ts)
// ---------------------------------------------------------------------------
export const CATALOGUE_CONSTRUCTS: CatalogueConstruct[] = [
  { id: 'cn-1', kind: 'Question Set Version', name: 'Core service set · v3', status: 'draft', version: 'v3', origin: 'runtime-authored', usedBy: 'Not yet used by any configuration', updated: '2026-09-29T11:00:00Z', gates: [{ name: 'Every item references an active Question Version', satisfied: true, detail: '5 of 5 items resolve' }, { name: 'Previous version still effective for configurations', satisfied: true, detail: 'v2 remains active until retired' }], retirementBlockers: [], permission: 'platform.catalogue.publish' },
  { id: 'cn-2', kind: 'Assembly Template Version', name: 'Hospitality quick check · v2', status: 'draft', version: 'v2', origin: 'runtime-authored', usedBy: 'Not yet used', updated: '2026-09-30T08:30:00Z', gates: [{ name: 'Pool entries reference active Measures', satisfied: false, detail: '1 pool entry references a Measure without an active Question Version' }], retirementBlockers: [], permission: 'platform.catalogue.publish' },
  { id: 'cn-3', kind: 'Conditional Rule', name: 'Show “Ease of Service” only after a service event', status: 'draft', origin: 'runtime-authored', usedBy: 'Not yet used', updated: '2026-09-25T14:10:00Z', gates: [{ name: 'Rule references an active Assembly Template Version', satisfied: true, detail: 'Hospitality quick check · v1 (active)' }], retirementBlockers: [], permission: 'platform.catalogue.publish' },
  { id: 'cn-4', kind: 'Sufficiency Rule', name: 'Speed of Service sufficiency', status: 'draft', origin: 'runtime-authored', usedBy: 'Not yet used', updated: '2026-09-22T09:00:00Z', gates: [{ name: 'Measure is active', satisfied: true, detail: 'Speed of Service (MLB-COR-002)' }], retirementBlockers: [], permission: 'platform.catalogue.publish' },
  { id: 'cn-5', kind: 'Question Set Version', name: 'Core service set · v2', status: 'active', version: 'v2', origin: 'runtime-authored', usedBy: '4 effective Feedback Point configurations', updated: '2026-06-01T10:00:00Z', gates: [], retirementBlockers: [{ reference: 'effective_configurations', count: 4 }], permission: 'platform.catalogue.retire' },
  { id: 'cn-6', kind: 'Assembly Template Version', name: 'Hospitality quick check · v1', status: 'active', version: 'v1', origin: 'runtime-authored', usedBy: '2 effective Feedback Point configurations', updated: '2026-06-01T10:30:00Z', gates: [], retirementBlockers: [{ reference: 'effective_configurations', count: 2 }], permission: 'platform.catalogue.retire' },
  { id: 'cn-7', kind: 'Rotation Strategy', name: 'Weekly rotation · extended', status: 'active', origin: 'runtime-authored', usedBy: 'No known references', updated: '2026-07-12T10:00:00Z', gates: [], retirementBlockers: [], permission: 'platform.catalogue.retire' },
  { id: 'cn-8', kind: 'Question Set Version', name: 'Core service set · v1', status: 'retired', version: 'v1', origin: 'runtime-authored', usedBy: 'History only', updated: '2026-06-01T10:05:00Z', gates: [], retirementBlockers: [], permission: 'platform.catalogue.retire' },
  { id: 'cn-9', kind: 'Response Scale Version', name: 'Quality scale · v0', status: 'retired', version: 'v0', origin: 'runtime-authored', usedBy: 'History only', updated: '2026-05-10T08:00:00Z', gates: [], retirementBlockers: [], permission: 'platform.catalogue.retire' },
];

export const CATALOGUE_FINDINGS: CatalogueFinding[] = [
  { code: 'multiple_active_question_versions', category: 'integrity', construct: 'question_version', detail: 'Standard Question “Staff Courtesy” (SQ-COR-004) has two active versions: EN-1.1 and EN-1.2.', blocking: true },
  { code: 'inactive_draft_residue', category: 'limitation', construct: 'standard_question', detail: '3 inactive draft rows may be projection residue. Stored state cannot tell a legitimate draft from residue (known limitation).', blocking: false },
  { code: 'language_readiness_incomplete', category: 'readiness', construct: 'language_readiness', detail: 'No French Question Translation is published for any Standard Question. English is the only presentable language.', blocking: false },
];

export const CATALOGUE_COUNTS = {
  runtimeMeasures: { draft: 0, active: 88, retired: 0 },
  standardQuestions: { draft: 3, active: 88, retired: 0 },
  questionSetVersions: { draft: 1, active: 1, retired: 1 },
  assemblyTemplateVersions: { draft: 1, active: 1, retired: 0 },
  responseScaleVersions: { draft: 0, active: 14, retired: 1 },
  sufficiencyRules: { draft: 1, active: 0, retired: 0 },
};

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export const SETTINGS: SettingEntry[] = [
  { key: 'support_context.lifetime_minutes', name: 'Support context lifetime', cls: 'B', owner: 'Support context service', effective: '30 minutes (database cap 60)', nature: 'read_only', why: 'Product policy held as a code constant; changed through the repository path, not here.' },
  { key: 'catalogue.lifecycle_vocabulary', name: 'Catalogue lifecycle vocabulary', cls: 'B', owner: 'Catalogue owners', effective: 'draft → active → retired', nature: 'read_only', why: 'Product truth. Lifecycle changes are the publish / retire commands, not settings.' },
  { key: 'commercial.tier_policy', name: 'Commercial tiers in use', cls: 'B', owner: 'Commercial service', effective: 'basic · 6    premium · 4', nature: 'read_only', why: 'Changed only by the governed tier-change command on an Organisation.' },
  { key: 'operator.permission_catalogue', name: 'Registered operator permissions', cls: 'F', owner: 'Platform Authority', effective: '28 permissions', nature: 'read_only', why: 'Derived fact.' },
  { key: 'audit.append_only', name: 'Operator audit is append-only', cls: 'F', owner: 'Platform Authority', effective: 'Yes (observed trigger)', nature: 'read_only', why: 'Derived fact.' },
  { key: 'provider.authentication', name: 'Authentication provider', cls: 'E', owner: 'Authentication adapter', effective: 'Reports kind and provider subject only', nature: 'provider_dependent', why: 'The provider owns account state, MFA, verification and recovery. Fedoo exposes none of them.' },
  { key: 'provider.delivery', name: 'Delivery provider (invitations, notifications)', cls: 'E', owner: 'None selected', effective: 'not_configured', nature: 'unavailable', why: 'No approved delivery provider or adapter exists. Nothing is simulated.' },
  { key: 'provider.payment', name: 'Payment provider', cls: 'E', owner: 'None (payments deferred)', effective: 'not_configured', nature: 'unavailable', why: 'Payment mechanics are deferred.' },
  { key: 'provider.hosting_edge', name: 'Hosting / edge provider', cls: 'E', owner: 'Deployment tooling', effective: 'not_observed', nature: 'provider_dependent', why: 'No deployment telemetry exists. Never inferred healthy.' },
  { key: 'deployment.environment', name: 'Deployment / environment configuration', cls: 'C', owner: 'Deployment tooling', effective: 'Withheld by policy', nature: 'withheld', why: 'Environment values, hostnames and connection settings are never read or edited here.' },
  { key: 'deployment.secrets', name: 'Secrets and credentials', cls: 'D', owner: 'Secret-management process', effective: 'Withheld by policy', nature: 'withheld', why: 'Tokens, keys, passwords and signing material are never returned.' },
];
export const CAPABILITIES: Capability[] = [
  { id: 'notif', name: 'Notification routing', state: 'unavailable', owner: 'None', reason: 'No delivery adapter, destination model, routing rules or delivery status exists.', needs: 'Approved delivery provider and a settings owner' },
  { id: 'invite', name: 'Invitation / recovery routing', state: 'unavailable', owner: 'None', reason: 'No invitation state, credential or expiry model. A persisted invitation is never shown as sent.', needs: 'Delivery provider and an invitation owner' },
  { id: 'recovery', name: 'Provider-backed recovery', state: 'unavailable', owner: 'Authentication provider (not selected)', reason: 'Unavailable, not failed. The adapter exposes only kind and provider subject.', needs: 'Provider recovery primitive and approved ownership policy' },
  { id: 'support', name: 'Read-only support context', state: 'implemented', owner: 'Support context service', reason: 'Enter, exit and workspace are implemented and audited.' },
  { id: 'evidence', name: 'Sensitive Evidence access', state: 'blocked', owner: 'None', reason: 'No separately approved sensitive-visibility permission exists. Denied by default.' },
  { id: 'notes', name: 'Support notes', state: 'excluded', owner: 'None', reason: 'Not an initial requirement. No table, service or route exists.' },
  { id: 'incident', name: 'Incident / escalation routing', state: 'unavailable', owner: 'None', reason: 'No incident lifecycle, paging or acknowledgement exists. Needs Attention is derived and read-only.', needs: 'Failure source, ownership model and monitoring tooling' },
  { id: 'prefs', name: 'Operator preferences', state: 'excluded', owner: 'None', reason: 'No basis in FOA-001.' },
];
export const GOVERNED_RUNTIME_SETTINGS_COUNT = 0;

export const DEFERRED_ATTENTION_SOURCES: Record<string, string> = {
  'Organisation suspended': 'No operator review obligation or review state exists; suspension is shown factually in Platform Health.',
  'Failed onboarding': 'No failed-onboarding state is persisted; incomplete setup is not a failure.',
  'Low commercial capacity': 'No governed low-balance threshold; zero CU is surfaced factually.',
  'Repeated acceptance failures': 'Rejected acceptances roll back and persist no failure reason.',
  'Result / Signal pipeline history': 'No durable failure history; only a live technical failure is observable.',
  'Access recovery cases': 'No recovery case state; provider recovery is unavailable.',
  'Unresolved commercial commands': 'Commercial commands are synchronous; no pending state exists.',
};

export const PRIOR_SUPPORT_CONTEXT: SupportContext = {
  id: 'sc-prev', orgId: ORGANISATIONS[3].id, operator: 'Amara Okello', purpose: 'organisation-support',
  reason: 'Organisation asked why Submissions were not counted', enteredAt: new Date('2026-09-29T10:00:00Z').getTime(),
  expiresAt: new Date('2026-09-29T10:30:00Z').getTime(), endedAt: new Date('2026-09-29T10:14:00Z').getTime(),
};
