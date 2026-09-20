// ============================================================================
// FEDOO PRODUCT OPERATIONS — PROTOTYPE EXPERIENCE DATA (NON-AUTHORITATIVE)
// ============================================================================
// [PROTOTYPE ASSUMPTION ANNOTATION — Product Truth realignment]:
// This module supplies OPERATIONAL FIXTURES for the Product Operations control
// plane experience reference. It does not define Product Truth: Measure,
// Instrument, eligibility, applicability, equivalence, comparability, scale,
// question-set, signal and lifecycle semantics remain governed elsewhere.
// Readiness states, mappings, recommendations, templates, drafts, diagnostics
// and history below are prototype illustrations for review only.
// ============================================================================

import { Measure } from '../types';

export type LifecycleState = 'Active' | 'Draft' | 'Review' | 'Retired';
export type Readiness = 'Defined' | 'Instrument-ready' | 'Operational' | 'Incomplete';
export type LanguageState = 'Operational' | 'In progress' | 'Not started';
export type EquivalenceState = 'Approved' | 'Not approved';

export interface OpsVariant {
  id: string;
  label: string;
  language: 'English' | 'French';
  state: 'Published' | 'Draft' | 'Candidate' | 'Approved';
}

export interface OpsInstrument {
  id: string;
  measureId: string;
  standardQuestion: string;
  variants: OpsVariant[];
  scaleFamily: string;
  eligibility: string;
  english: 'Operational' | 'Draft' | 'Missing';
  french: 'Operational' | 'Candidate' | 'Missing';
  equivalence: EquivalenceState;
  version: string;
  state: LifecycleState;
}

export interface OpsMeasure {
  id: string;
  name: string;
  definition: string;
  domain: string;
  lifecycle: LifecycleState;
  readiness: Readiness;
  instrumentId?: string;
  sectors: string[];
  // Language coverage derives from the Instrument, not the Measure itself.
  // 'Not available' means no Instrument exists for this Measure yet.
  english: 'Operational' | 'Draft' | 'Missing' | 'Not available';
  french: 'Operational' | 'Candidate' | 'Missing' | 'Not available';
  recommendedFor: string[];
  usedInTemplates: string[];
  version: string;
}

// Canonical Fedoo catalogue size (Product Truth authority). This prototype
// loads a bounded fixture subset; the two must not be conflated in the UI.
export const CANONICAL_MEASURE_COUNT = 84;

export interface OpsRecommendationMap {
  id: string;
  context: string;
  descriptor: string;
  recommended: string[];
  alsoRelevant: string[];
  reason: string;
  state: LifecycleState;
}

export interface OpsTemplate {
  id: string;
  name: string;
  context: string;
  measureIntents: string[];
  burden: 'Quick' | 'Standard' | 'Extended';
  languages: string;
  state: LifecycleState;
}

export interface OpsDraft {
  id: string;
  objectType: 'Instrument' | 'Measure' | 'Recommendation map' | 'Template';
  objectName: string;
  state: 'Draft' | 'Review' | 'Published';
  operator: string;
  updated: string;
  summary: string;
  body?: string;
}

export interface OpsDiagnostic {
  id: string;
  state: 'Needs correction' | 'Missing reference' | 'Incomplete metadata';
  object: string;
  detail: string;
  resolved: boolean;
}

export interface OpsHistoryEntry {
  id: string;
  time: string;
  operator: string;
  object: string;
  action: string;
  versionState: string;
}

export interface OpsDescriptor {
  id: string;
  term: string;
  observed: string;
  reviewed: boolean;
}

export interface ProductOpsModel {
  measures: OpsMeasure[];
  instruments: OpsInstrument[];
  recommendations: OpsRecommendationMap[];
  templates: OpsTemplate[];
  drafts: OpsDraft[];
  diagnostics: OpsDiagnostic[];
  history: OpsHistoryEntry[];
  descriptors: OpsDescriptor[];
}

const OPERATIONAL_IDS = [
  'overall_experience',
  'speed_of_service',
  'staff_courtesy',
  'food_beverage_quality',
  'likelihood_to_return',
];

const SECTOR_MAP: Record<string, string[]> = {
  overall_experience: ['Universal'],
  staff_courtesy: ['Universal'],
  likelihood_to_return: ['Universal'],
  value_for_experience: ['Universal'],
  speed_of_service: ['Café & Dining', 'Clinic & Healthcare', 'Retail', 'Hotels'],
  food_beverage_quality: ['Café & Dining', 'Hotels'],
  order_accuracy: ['Café & Dining'],
  cleanliness_comfort: ['Beauty', 'Café & Dining', 'Clinic & Healthcare', 'Hotels', 'Retail'],
  wait_experience: ['Beauty', 'Café & Dining', 'Clinic & Healthcare', 'Hotels'],
  treatment_service_result: ['Beauty'],
  practitioner_skill: ['Beauty'],
  treatment_comfort: ['Beauty'],
  appointment_access: ['Clinic & Healthcare'],
  clinical_explanation_clarity: ['Clinic & Healthcare'],
  clinician_empathy: ['Clinic & Healthcare'],
  privacy: ['Clinic & Healthcare', 'Beauty'],
  queue_clarity: ['Café & Dining', 'Retail'],
  digital_ordering_ease: ['Café & Dining'],
};

const TEMPLATE_USAGE: Record<string, string[]> = {
  overall_experience: ['Salon Visit', 'Café Visit', 'Clinic Reception'],
  staff_courtesy: ['Salon Visit', 'Café Visit', 'Clinic Reception'],
  treatment_service_result: ['Salon Visit'],
  practitioner_skill: ['Salon Visit'],
  treatment_comfort: ['Salon Visit'],
  food_beverage_quality: ['Café Visit'],
  speed_of_service: ['Café Visit'],
  order_accuracy: ['Café Visit'],
  appointment_access: ['Clinic Reception'],
  wait_experience: ['Clinic Reception', 'Salon Visit'],
  clinical_explanation_clarity: ['Clinic Reception'],
  privacy: ['Clinic Reception'],
};

function buildInstruments(measures: Measure[]): OpsInstrument[] {
  const byId = new Map(measures.map((m) => [m.id, m]));
  const defs: {
    measureId: string;
    eligibility: string;
    version: string;
    french: OpsInstrument['french'];
    variants: OpsVariant[];
  }[] = [
    {
      measureId: 'overall_experience',
      eligibility: 'All service contexts',
      version: 'v1.0',
      french: 'Candidate',
      variants: [
        { id: 'v-en', label: 'Standard English', language: 'English', state: 'Published' },
        { id: 'v-fr', label: 'French candidate', language: 'French', state: 'Candidate' },
      ],
    },
    {
      measureId: 'staff_courtesy',
      eligibility: 'Human-delivered service',
      version: 'v2.0',
      french: 'Candidate',
      variants: [
        { id: 'v-en', label: 'Standard English', language: 'English', state: 'Published' },
        { id: 'v-en-alt', label: 'Warmth wording variant', language: 'English', state: 'Published' },
        { id: 'v-fr', label: 'French candidate', language: 'French', state: 'Candidate' },
      ],
    },
    {
      measureId: 'speed_of_service',
      eligibility: 'Counter, table and branch service',
      version: 'v1.0',
      french: 'Candidate',
      variants: [
        { id: 'v-en', label: 'Standard English', language: 'English', state: 'Published' },
        { id: 'v-fr', label: 'French candidate', language: 'French', state: 'Candidate' },
      ],
    },
    {
      measureId: 'food_beverage_quality',
      eligibility: 'Food and beverage service',
      version: 'v1.0',
      french: 'Candidate',
      variants: [
        { id: 'v-en', label: 'Standard English', language: 'English', state: 'Published' },
      ],
    },
    {
      measureId: 'likelihood_to_return',
      eligibility: 'All service contexts',
      version: 'v1.0',
      french: 'Missing',
      variants: [{ id: 'v-en', label: 'Standard English', language: 'English', state: 'Published' }],
    },
  ];

  return defs
    .map((d): OpsInstrument | null => {
      const m = byId.get(d.measureId);
      if (!m) return null;
      return {
        id: `inst-${d.measureId}`,
        measureId: d.measureId,
        standardQuestion: m.standardQuestion,
        variants: d.variants,
        scaleFamily: m.scaleFamily,
        eligibility: d.eligibility,
        english: 'Operational' as const,
        french: d.french,
        equivalence: 'Not approved' as const,
        version: d.version,
        state: 'Active' as const,
      };
    })
    .filter((x): x is OpsInstrument => Boolean(x));
}

export function buildProductOpsModel(measures: Measure[]): ProductOpsModel {
  const instruments = buildInstruments(measures);
  const instrumentByMeasure = new Map(instruments.map((i) => [i.measureId, i]));

  const opsMeasures: OpsMeasure[] = measures.map((m) => {
    const instrument = instrumentByMeasure.get(m.id);
    const lifecycle: LifecycleState =
      m.availability === 'available' ? 'Active' : m.availability === 'coming_soon' ? 'Draft' : 'Retired';
    const readiness: Readiness =
      m.availability === 'coming_soon'
        ? 'Incomplete'
        : OPERATIONAL_IDS.includes(m.id)
        ? 'Operational'
        : 'Defined';

    return {
      id: m.id,
      name: m.name,
      definition: m.shortDescription,
      domain: m.category,
      lifecycle,
      readiness,
      instrumentId: instrument?.id,
      sectors: SECTOR_MAP[m.id] || ['Universal'],
      // Coverage follows the Instrument. Without an Instrument, no language is
      // operational — the Measure may exist but is not yet instrument-ready.
      english: instrument ? instrument.english : 'Not available',
      french: instrument ? instrument.french : 'Not available',
      recommendedFor: SECTOR_MAP[m.id] || [],
      usedInTemplates: TEMPLATE_USAGE[m.id] || [],
      version: m.version,
    };
  });

  return {
    measures: opsMeasures,
    instruments,
    recommendations: [
      {
        id: 'rec-beauty',
        context: 'Beauty & Personal Care',
        descriptor: 'Hair salon · direct practitioner service',
        recommended: ['overall_experience', 'treatment_service_result', 'practitioner_skill', 'staff_courtesy'],
        alsoRelevant: ['wait_experience', 'cleanliness_comfort', 'treatment_comfort', 'likelihood_to_return'],
        reason: 'Personal-care outcome delivered by a named practitioner.',
        state: 'Active',
      },
      {
        id: 'rec-cafe',
        context: 'Café & Dining',
        descriptor: 'Café · counter and table service',
        recommended: ['overall_experience', 'food_beverage_quality', 'speed_of_service', 'staff_courtesy'],
        alsoRelevant: ['order_accuracy', 'cleanliness_comfort', 'likelihood_to_return'],
        reason: 'Product quality and service pace dominate the visit.',
        state: 'Active',
      },
      {
        id: 'rec-clinic',
        context: 'Clinic & Healthcare',
        descriptor: 'Clinic · appointment-based consultation',
        recommended: [
          'overall_experience',
          'appointment_access',
          'wait_experience',
          'clinical_explanation_clarity',
          'clinician_empathy',
          'privacy',
        ],
        alsoRelevant: ['staff_courtesy', 'cleanliness_comfort', 'likelihood_to_return'],
        reason: 'Access, clarity and trust shape the patient experience.',
        state: 'Active',
      },
    ],
    templates: [
      {
        id: 'tpl-salon',
        name: 'Salon Visit',
        context: 'Beauty & Personal Care',
        measureIntents: ['overall_experience', 'treatment_service_result', 'practitioner_skill', 'staff_courtesy'],
        burden: 'Standard',
        languages: 'English operational',
        state: 'Active',
      },
      {
        id: 'tpl-cafe',
        name: 'Café Visit',
        context: 'Café & Dining',
        measureIntents: ['overall_experience', 'food_beverage_quality', 'speed_of_service', 'staff_courtesy'],
        burden: 'Standard',
        languages: 'English operational',
        state: 'Active',
      },
      {
        id: 'tpl-clinic',
        name: 'Clinic Reception',
        context: 'Clinic & Healthcare',
        measureIntents: ['overall_experience', 'appointment_access', 'wait_experience', 'privacy'],
        burden: 'Standard',
        languages: 'English operational',
        state: 'Active',
      },
    ],
    drafts: [
      {
        id: 'draft-1',
        objectType: 'Instrument',
        objectName: 'Staff Courtesy — French candidate',
        state: 'Review',
        operator: 'A. Nkurunziza',
        updated: 'Today',
        summary: 'French candidate wording for review; equivalence not yet assessed.',
        body: 'Dans quelle mesure avez-vous été satisfait de la courtoisie du personnel aujourd’hui ?',
      },
      {
        id: 'draft-2',
        objectType: 'Recommendation map',
        objectName: 'Beauty recommendation set',
        state: 'Draft',
        operator: 'C. Uwase',
        updated: 'Yesterday',
        summary: 'Add Treatment Comfort as also-relevant for treatment-led services.',
      },
    ],
    diagnostics: [
      {
        id: 'diag-1',
        state: 'Missing reference',
        object: 'Café Visit template',
        detail: 'References a Measure with no instrument-ready definition (Order Accuracy).',
        resolved: false,
      },
      {
        id: 'diag-2',
        state: 'Incomplete metadata',
        object: 'Queue & Ordering Clarity',
        detail: 'Draft Measure has incomplete eligibility metadata.',
        resolved: false,
      },
      {
        id: 'diag-3',
        state: 'Needs correction',
        object: 'Clinic Reception template',
        detail: 'References a retired scale version (Privacy v0.9).',
        resolved: false,
      },
    ],
    history: [
      { id: 'h1', time: 'Today · 09:14', operator: 'A. Nkurunziza', object: 'Staff Courtesy', action: 'Published new Instrument version', versionState: 'v2.0' },
      { id: 'h2', time: 'Today · 08:40', operator: 'C. Uwase', object: 'English wording', action: 'Updated via new Instrument version', versionState: 'v2.0' },
      { id: 'h3', time: 'Yesterday', operator: 'A. Nkurunziza', object: 'Staff Courtesy', action: 'Added French candidate variant', versionState: 'Draft' },
      { id: 'h4', time: '2 days ago', operator: 'J. Habimana', object: 'Beauty recommendation map', action: 'Updated recommended starting set', versionState: 'Active' },
      { id: 'h5', time: '3 days ago', operator: 'J. Habimana', object: 'Salon Visit template', action: 'Published template', versionState: 'Active' },
    ],
    descriptors: [
      { id: 'desc-1', term: 'Bridal Styling', observed: 'Observed across 14 beauty businesses', reviewed: false },
      { id: 'desc-2', term: 'Kinyozi (barber)', observed: 'Observed across 6 beauty businesses', reviewed: false },
      { id: 'desc-3', term: 'Walk-in triage', observed: 'Observed across 9 clinic businesses', reviewed: false },
    ],
  };
}

export const SECTOR_CONTEXTS = [
  'Universal',
  'Beauty',
  'Café & Dining',
  'Clinic & Healthcare',
  'Hotels',
  'Retail',
];
