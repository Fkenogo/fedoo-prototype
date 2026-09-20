// ============================================================================
// FEDOO EXPERIENCE REFERENCE — DATA TYPES & INTERFACES
// ============================================================================
// [PROTOTYPE ASSUMPTION ANNOTATION — Product Truth realignment]:
// This module provides the EXPERIENCE model for Fedoo, not Product Truth.
// In production, all analytical output is supplied by the governed Fedoo
// engine (EA-01→EA-06 at acb054a):
//   Measures / Instruments / Question Set / Effective Configuration /
//   Session Composition / Submission-Acceptance-Evidence / Measure Results /
//   Service Signals / Signal History.
// Client-side movement labels, sufficiency thresholds, review triggers,
// scores and comparability claims below are PROTOTYPE SIMULATION ONLY and
// must not be presented as production authority. Governed rules:
//   - Favourable = points 4+5 on Higher-favourable 5-pt families only.
//   - Descriptive display any N>0; N=0 → NO_EVIDENCE (never 0%).
//   - Period comparison requires N>=10 in BOTH periods (EA-05 v1).
//   - Movement is a raw percentage-point delta, never Improving/Stable/
//     Declining, material-movement, attention or statistical claims.
// ============================================================================

export type ScaleFamily = 'quality' | 'satisfaction' | 'likelihood';

export interface ScaleOption {
  value: string;
  scoreIndex: number; // 1 to 5 (1 = lowest, 5 = highest)
  favourable: boolean; // 4 and 5 are favourable
}

export type BurdenLevel = 'quick' | 'standard' | 'extended';

export type EndpointStatus = 'active' | 'paused' | 'draft';

// Governed analytical states — PROTOTYPE SIMULATION ONLY (non-authoritative).
// Production uses EA-04/EA-05 states: EVIDENCE_AVAILABLE / NO_EVIDENCE,
// COMPARISON_AVAILABLE / COMPARISON_UNAVAILABLE (insufficient evidence) /
// NO_COMPARABLE_SERIES / SERIES_BREAK. The labels below exist only to drive
// prototype fixtures and must be rendered as factual evidence counts.
export type EvidenceLevel = 'sufficient' | 'limited' | 'none';
// DEPRECATED prototype simulation: never render Improving/Stable/Declining in
// production. Production renders raw pp delta + comparison state only.
export type MovementDirection = 'improving' | 'steady' | 'declining' | 'unavailable';
// Governed comparison state for the Experience Reference (factual only).
export type ComparisonState =
  | 'AVAILABLE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NO_EVIDENCE'
  | 'SERIES_BREAK'
  | 'UNAVAILABLE';
// DEPRECATED prototype simulation flag: production attention requires governed
// thresholds and is never derived client-side. Render as "flagged for review
// (prototype simulation — non-authoritative)" where shown.
export type ReviewState = 'needs_review' | 'clear';

// Measure availability in customer context
export type MeasureAvailability = 'available' | 'coming_soon' | 'not_relevant';

export interface Measure {
  id: string;
  name: string;
  shortDescription: string;
  contextNotes: string;
  isCore: boolean;
  isRecommended: boolean;
  availability: MeasureAvailability;
  standardQuestion: string;
  standardQuestionFr?: string;
  scaleFamily: ScaleFamily;
  category: 'Core Experience' | 'Service Delivery' | 'People & Courtesy' | 'Environment & Space' | 'Loyalty & Return' | 'Contextual';
  typicalBurden: BurdenLevel;
  comparableAcrossLocations: boolean;
  version: string;
  rationale?: string;
}

export interface EndpointConfigHistoryEntry {
  id: string;
  timestamp: string;
  description: string;
  activeMeasureIds: string[];
  // Business-facing change detail for the Feedback Point "Changes" list.
  // Prototype display only; production preserves the governed lineage behind
  // the scenes and never exposes configuration IDs to the Organisation.
  added?: string[];
  removed?: string[];
}

export interface Endpoint {
  id: string;
  humanName: string;
  locationId: string;
  status: EndpointStatus;
  activeMeasureIds: string[];
  supportedChannels: ('qr' | 'link' | 'whatsapp' | 'sms')[];
  createdAt: string;
  lastResponseAt: string | null;
  totalResponses: number;
  burdenLevel: BurdenLevel;
  channelNotes?: string;
  // Prototype experience context for the Feedback Point (human-readable only).
  // Not product identity: production keeps the persistent access identity hidden.
  contextNote?: string;
  // Friendly, persistent customer-facing access link (prototype display only).
  friendlyLink?: string;
  configHistory: EndpointConfigHistoryEntry[];
}

export interface Location {
  id: string;
  name: string;
  type: 'physical' | 'service_unit';
  addressOrDetail: string;
  managerName?: string;
  totalResponses: number;
  lastFeedbackAt: string | null;
  endpointsCount: number;
  activeMeasuresCount: number;
  status: 'active' | 'limited_evidence' | 'inactive';
}

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface HistoryPoint {
  period: string;
  favourablePercentage: number;
  responses: number;
}

export interface NeedsReviewItem {
  id: string;
  measureId: string;
  measureName: string;
  locationId: string;
  locationName: string;
  headline: string;
  explanation: string;
  evidenceNote: string;
  severity: 'high' | 'medium';
}

export interface ServiceSignal {
  measureId: string;
  locationId: string; // 'all' or specific locationId
  scoreLabel: string;
  favourablePercentage: number | null; // null if no evidence
  responseCount: number;
  evidenceLevel: EvidenceLevel; // prototype simulation of EA-04/EA-05 evidence state
  // Governed comparison (factual): raw pp delta only; direction labels are
  // prototype simulation and must not be carried into production.
  movement: {
    direction: MovementDirection; // DEPRECATED simulation — render factually
    deltaPoints?: number; // raw percentage-point delta vs comparison period
    comparedToLabel?: string;
    // Factual governed rendering (preferred): e.g. "+3.0pp vs previous 30 days
    // (comparison available, N>=10 both periods)" or "comparison unavailable —
    // insufficient evidence".
    comparisonState?: ComparisonState;
  };
  distribution: DistributionItem[];
  historySeries?: HistoryPoint[];
  needsReview?: {
    headline: string;
    explanation: string;
  };
}

export interface FeedbackAnswer {
  measureId: string;
  questionText: string;
  selectedValue: string;
  scoreIndex: number;
  required?: boolean;
}

export interface FeedbackSession {
  id: string;
  endpointId: string;
  locationId: string;
  timestamp: string;
  answers: FeedbackAnswer[];
  optionalComment?: string;
  channel: 'qr' | 'link' | 'whatsapp' | 'sms';
}

export interface Organisation {
  id: string;
  name: string;
  businessType: string;
  operatingCountry: string;
  primaryLanguage: 'en' | 'fr';
  locations: Location[];
  onboardingData?: OnboardingData;
}

export interface OnboardingData {
  organisationName: string;
  country: string;
  city: string;
  websiteOrSocial?: string;
  sector: string;
  category: string;
  customSectorDescription?: string;
  services: string[];
  serviceModels: string[];
  contextualAnswers: Record<string, string>;
  firstLocationName: string;
  firstLocationCity: string;
  firstLocationAddress?: string;
  hasMoreLocations: 'no' | 'yes';
  timezone: string;
  timezoneLabel: string;
  timezoneId?: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  adminLanguage: 'en' | 'fr';
  feedbackLanguages: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Organisation Admin' | 'Location Manager' | 'Service Observer';
  locationScope: string;
}

// Shell & Prototype Routing Types
export type AppRoute = 'app' | 'setup' | 'feedback-point-setup' | 'feedback' | 'operator';
export type AppTab = 'overview' | 'feedback-points' | 'what-we-track' | 'locations' | 'activity';
export type PrototypeScenario =
  | 'multi-location'
  | 'single-location'
  | 'empty-state'
  | 'vera-beauty'
  | 'city-clinic';

// ---------------------------------------------------------------------------
// FIRST FEEDBACK POINT — RECOMMENDATION EXPERIENCE TYPES (PROTOTYPE ONLY)
// ---------------------------------------------------------------------------
// [PROTOTYPE ASSUMPTION ANNOTATION — Product Truth realignment]:
// These types describe how Fedoo's recommendation EXPERIENCE is demonstrated,
// not the governed recommendation/applicability rules. Production resolves
// eligibility, applicability, Instruments and Question Sets from Product Truth.
export type AreaProvenance = 'recommended' | 'also_relevant' | 'browse';

export interface RecommendedArea {
  measureId: string;
  provenance: AreaProvenance;
  // Plain-language reason shown to the Organisation. Never exposes rule logic.
  reason?: string;
}

export interface BrowseGroup {
  id: string;
  label: string;
  measureIds: string[];
}

export interface SectorRecommendationProfile {
  id: 'beauty' | 'cafe' | 'clinic' | 'hotel' | 'generic';
  label: string;
  nameSuggestions: string[];
  recommended: RecommendedArea[];
  alsoRelevant: RecommendedArea[];
  browseGroups: BrowseGroup[];
}
