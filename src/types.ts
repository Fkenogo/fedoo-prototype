export type ScaleFamily = 'quality' | 'satisfaction' | 'likelihood';

export interface ScaleOption {
  value: string;
  scoreIndex: number; // 1 to 5 (1 = lowest, 5 = highest)
  favourable: boolean; // 4 and 5 are favourable
}

export type BurdenLevel = 'quick' | 'standard' | 'extended';

export type EndpointStatus = 'active' | 'paused' | 'ready' | 'draft';

export type SufficiencyState = 'healthy' | 'early_signal' | 'limited_evidence' | 'insufficient_evidence';

export interface Measure {
  id: string;
  name: string;
  shortDescription: string;
  contextNotes: string;
  isCore: boolean;
  isRecommended: boolean;
  standardQuestion: string;
  standardQuestionFr?: string;
  scaleFamily: ScaleFamily;
  category: 'Core Experience' | 'Service Delivery' | 'People & Courtesy' | 'Environment & Space' | 'Loyalty & Return' | 'Contextual';
  typicalBurden: BurdenLevel;
  comparableAcrossLocations: boolean;
  version: string;
  rationale?: string;
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

export interface ServiceSignal {
  measureId: string;
  locationId: string; // 'all' or specific locationId
  scoreLabel: string;
  favourablePercentage: number;
  responseCount: number;
  sufficiencyState: SufficiencyState;
  periodChange?: {
    deltaPoints: number;
    direction: 'up' | 'down' | 'steady';
    comparePeriodLabel: string;
  };
  distribution: DistributionItem[];
  historySeries: HistoryPoint[];
  attentionFlag?: {
    type: 'needs_review' | 'meaningful_change' | 'early_signal';
    explanation: string;
  };
}

export interface FeedbackAnswer {
  measureId: string;
  questionText: string;
  selectedValue: string;
  scoreIndex: number;
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
  locationScope: string; // 'All Locations' or specific location name
}
