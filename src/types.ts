// ============================================================================
// FEDOO EXPERIENCE REFERENCE — DATA TYPES & INTERFACES
// ============================================================================
// [PROTOTYPE ASSUMPTION ANNOTATION]:
// This module provides the experience model for Fedoo. In production, analytical
// calculations (sufficiency, movement, review triggers) will be supplied by
// the governed Fedoo engine rather than determined by the client application.
// ============================================================================

export type ScaleFamily = 'quality' | 'satisfaction' | 'likelihood';

export interface ScaleOption {
  value: string;
  scoreIndex: number; // 1 to 5 (1 = lowest, 5 = highest)
  favourable: boolean; // 4 and 5 are favourable
}

export type BurdenLevel = 'quick' | 'standard' | 'extended';

export type EndpointStatus = 'active' | 'paused' | 'draft';

// Governed analytical states received from engine
export type EvidenceLevel = 'sufficient' | 'limited' | 'none';
export type MovementDirection = 'improving' | 'steady' | 'declining' | 'unavailable';
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
  evidenceLevel: EvidenceLevel;
  movement: {
    direction: MovementDirection;
    deltaPoints?: number;
    comparedToLabel?: string;
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
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Organisation Admin' | 'Location Manager' | 'Service Observer';
  locationScope: string;
}

// Shell & Prototype Routing Types
export type AppRoute = 'app' | 'setup' | 'feedback' | 'operator';
export type AppTab = 'overview' | 'feedback-points' | 'what-we-track' | 'locations' | 'activity';
export type PrototypeScenario = 'multi-location' | 'single-location' | 'empty-state';
