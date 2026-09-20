// ============================================================================
// FIRST FEEDBACK POINT — RECOMMENDATION EXPERIENCE PROFILES (PROTOTYPE ONLY)
// ============================================================================
// [PROTOTYPE ASSUMPTION ANNOTATION — Product Truth realignment]:
// These profiles demonstrate HOW Fedoo presents recommendations for the first
// Feedback Point. They are NOT the governed recommendation / applicability /
// eligibility rules. Membership, grouping, ordering and reasons below are
// prototype content and will be superseded by the governed Fedoo instrument,
// applicability and recommendation library. Do not read as Product Truth.
// No operator approval is implied or required.
// ============================================================================

import { Organisation, SectorRecommendationProfile } from '../types';

const BEAUTY_PROFILE: SectorRecommendationProfile = {
  id: 'beauty',
  label: 'Personal care & beauty',
  nameSuggestions: ['Main Counter', 'Reception', 'Styling Area', 'Checkout'],
  recommended: [
    {
      measureId: 'overall_experience',
      provenance: 'recommended',
      reason: 'A simple starting point for how customers feel about the visit overall.',
    },
    {
      measureId: 'treatment_service_result',
      provenance: 'recommended',
      reason: 'Recommended because customers come here for a personal-care service outcome.',
    },
    {
      measureId: 'practitioner_skill',
      provenance: 'recommended',
      reason: 'Understand customer perception of the person delivering the service.',
    },
  ],
  alsoRelevant: [
    {
      measureId: 'staff_courtesy',
      provenance: 'also_relevant',
      reason: 'Captures frontline warmth and attentiveness from the customer view.',
    },
    {
      measureId: 'wait_experience',
      provenance: 'also_relevant',
      reason: 'Relevant because this Location accepts walk-ins and appointments.',
    },
    {
      measureId: 'cleanliness_comfort',
      provenance: 'also_relevant',
      reason: 'Useful for shared treatment, styling and waiting spaces.',
    },
    {
      measureId: 'treatment_comfort',
      provenance: 'also_relevant',
      reason: 'Shows how comfortable customers felt during the service itself.',
    },
    {
      measureId: 'value_for_experience',
      provenance: 'also_relevant',
      reason: 'Helps you see how customers weigh the price against the experience.',
    },
    {
      measureId: 'likelihood_to_return',
      provenance: 'also_relevant',
      reason: 'A simple read on whether customers intend to come back.',
    },
  ],
  browseGroups: [
    { id: 'overall', label: 'Overall experience', measureIds: ['overall_experience'] },
    { id: 'staff', label: 'Staff', measureIds: ['staff_courtesy', 'practitioner_skill'] },
    { id: 'speed', label: 'Speed & waiting', measureIds: ['wait_experience', 'speed_of_service'] },
    { id: 'outcome', label: 'Service outcome', measureIds: ['treatment_service_result', 'treatment_comfort'] },
    { id: 'value', label: 'Value & pricing', measureIds: ['value_for_experience'] },
    { id: 'environment', label: 'Environment', measureIds: ['cleanliness_comfort'] },
    { id: 'return', label: 'Loyalty & return', measureIds: ['likelihood_to_return'] },
  ],
};

const CAFE_PROFILE: SectorRecommendationProfile = {
  id: 'cafe',
  label: 'Café & casual dining',
  nameSuggestions: ['Dining Tables', 'Main Counter', 'Takeaway Counter', 'Terrace'],
  recommended: [
    {
      measureId: 'overall_experience',
      provenance: 'recommended',
      reason: 'The cleanest starting point for how customers rate the visit.',
    },
    {
      measureId: 'food_beverage_quality',
      provenance: 'recommended',
      reason: 'Recommended because food and drink quality is central to this business.',
    },
    {
      measureId: 'speed_of_service',
      provenance: 'recommended',
      reason: 'Relevant because customers notice waiting and order pacing.',
    },
    {
      measureId: 'staff_courtesy',
      provenance: 'recommended',
      reason: 'Captures how customers experience your frontline team.',
    },
  ],
  alsoRelevant: [
    {
      measureId: 'order_accuracy',
      provenance: 'also_relevant',
      reason: 'Useful for spotting order or kitchen communication slips.',
    },
    {
      measureId: 'likelihood_to_return',
      provenance: 'also_relevant',
      reason: 'A simple read on whether customers intend to come back.',
    },
    {
      measureId: 'cleanliness_comfort',
      provenance: 'also_relevant',
      reason: 'Relevant for dining rooms, terraces and waiting areas.',
    },
    {
      measureId: 'value_for_experience',
      provenance: 'also_relevant',
      reason: 'Helps you see how customers weigh price against the experience.',
    },
  ],
  browseGroups: [
    { id: 'overall', label: 'Overall experience', measureIds: ['overall_experience'] },
    { id: 'staff', label: 'Staff', measureIds: ['staff_courtesy'] },
    { id: 'speed', label: 'Speed & waiting', measureIds: ['speed_of_service', 'wait_experience'] },
    { id: 'outcome', label: 'Service outcome', measureIds: ['food_beverage_quality', 'order_accuracy'] },
    { id: 'value', label: 'Value & pricing', measureIds: ['value_for_experience'] },
    { id: 'environment', label: 'Environment', measureIds: ['cleanliness_comfort'] },
    { id: 'digital', label: 'Digital experience', measureIds: ['digital_ordering_ease'] },
  ],
};

const CLINIC_PROFILE: SectorRecommendationProfile = {
  id: 'clinic',
  label: 'Healthcare & clinic',
  nameSuggestions: ['Reception', 'Consultation Exit', 'Pharmacy Counter', 'Waiting Area'],
  recommended: [
    {
      measureId: 'overall_experience',
      provenance: 'recommended',
      reason: 'A simple starting point for how patients feel about the visit overall.',
    },
    {
      measureId: 'appointment_access',
      provenance: 'recommended',
      reason: 'Recommended because most visits begin with booking or being seen.',
    },
    {
      measureId: 'wait_experience',
      provenance: 'recommended',
      reason: 'Relevant because this Location manages queues and appointment times.',
    },
    {
      measureId: 'clinical_explanation_clarity',
      provenance: 'recommended',
      reason: 'Helps you see whether advice and next steps were clearly explained.',
    },
    {
      measureId: 'clinician_empathy',
      provenance: 'recommended',
      reason: 'Understand whether patients felt listened to and cared for.',
    },
    {
      measureId: 'privacy',
      provenance: 'recommended',
      reason: 'Important where personal or health information is shared.',
    },
  ],
  alsoRelevant: [
    {
      measureId: 'staff_courtesy',
      provenance: 'also_relevant',
      reason: 'Captures how patients experience reception and support staff.',
    },
    {
      measureId: 'cleanliness_comfort',
      provenance: 'also_relevant',
      reason: 'Relevant for waiting rooms, consultation and treatment spaces.',
    },
    {
      measureId: 'likelihood_to_return',
      provenance: 'also_relevant',
      reason: 'A simple read on whether patients would choose this clinic again.',
    },
  ],
  browseGroups: [
    { id: 'overall', label: 'Overall experience', measureIds: ['overall_experience'] },
    { id: 'staff', label: 'Staff', measureIds: ['staff_courtesy', 'clinician_empathy'] },
    { id: 'speed', label: 'Speed & waiting', measureIds: ['wait_experience', 'appointment_access'] },
    { id: 'outcome', label: 'Service outcome', measureIds: ['clinical_explanation_clarity'] },
    { id: 'trust', label: 'Trust / privacy / safety', measureIds: ['privacy'] },
    { id: 'environment', label: 'Environment', measureIds: ['cleanliness_comfort'] },
    { id: 'return', label: 'Loyalty & return', measureIds: ['likelihood_to_return'] },
  ],
};

// Minimal hotel experience-reference profile. Uses only already-present
// prototype areas — it introduces no new Measures or instrument semantics.
const HOTEL_PROFILE: SectorRecommendationProfile = {
  id: 'hotel',
  label: 'Hotels & accommodation',
  nameSuggestions: ['Reception', 'Front Desk', 'Checkout', 'Room Service', 'Restaurant'],
  recommended: [
    {
      measureId: 'overall_experience',
      provenance: 'recommended',
      reason: 'A simple starting point for how guests feel about their stay overall.',
    },
    {
      measureId: 'staff_courtesy',
      provenance: 'recommended',
      reason: 'Captures how guests experience your frontline and service teams.',
    },
    {
      measureId: 'cleanliness_comfort',
      provenance: 'recommended',
      reason: 'Relevant for rooms, dining and shared guest spaces.',
    },
    {
      measureId: 'wait_experience',
      provenance: 'recommended',
      reason: 'Relevant where guests wait at reception, check-in or dining.',
    },
  ],
  alsoRelevant: [
    {
      measureId: 'food_beverage_quality',
      provenance: 'also_relevant',
      reason: 'Useful where dining or room service forms part of the stay.',
    },
    {
      measureId: 'likelihood_to_return',
      provenance: 'also_relevant',
      reason: 'A simple read on whether guests intend to stay again.',
    },
    {
      measureId: 'value_for_experience',
      provenance: 'also_relevant',
      reason: 'Helps you see how guests weigh price against the stay.',
    },
  ],
  browseGroups: [
    { id: 'overall', label: 'Overall experience', measureIds: ['overall_experience'] },
    { id: 'staff', label: 'Staff', measureIds: ['staff_courtesy'] },
    { id: 'speed', label: 'Speed & waiting', measureIds: ['wait_experience', 'speed_of_service'] },
    { id: 'outcome', label: 'Service outcome', measureIds: ['food_beverage_quality', 'order_accuracy'] },
    { id: 'value', label: 'Value & pricing', measureIds: ['value_for_experience'] },
    { id: 'environment', label: 'Environment', measureIds: ['cleanliness_comfort'] },
    { id: 'return', label: 'Loyalty & return', measureIds: ['likelihood_to_return'] },
  ],
};

const GENERIC_PROFILE: SectorRecommendationProfile = {
  id: 'generic',
  label: 'Your service',
  nameSuggestions: ['Reception', 'Main Counter', 'Service Desk', 'Checkout'],
  recommended: [
    {
      measureId: 'overall_experience',
      provenance: 'recommended',
      reason: 'A simple starting point for how customers feel about the visit.',
    },
    {
      measureId: 'staff_courtesy',
      provenance: 'recommended',
      reason: 'Captures how customers experience your frontline team.',
    },
    {
      measureId: 'wait_experience',
      provenance: 'recommended',
      reason: 'Relevant wherever customers wait to be served.',
    },
  ],
  alsoRelevant: [
    {
      measureId: 'speed_of_service',
      provenance: 'also_relevant',
      reason: 'Relevant when service pace matters to customers.',
    },
    {
      measureId: 'cleanliness_comfort',
      provenance: 'also_relevant',
      reason: 'Useful for shared customer spaces.',
    },
    {
      measureId: 'likelihood_to_return',
      provenance: 'also_relevant',
      reason: 'A simple read on whether customers intend to come back.',
    },
  ],
  browseGroups: [
    { id: 'overall', label: 'Overall experience', measureIds: ['overall_experience'] },
    { id: 'staff', label: 'Staff', measureIds: ['staff_courtesy'] },
    { id: 'speed', label: 'Speed & waiting', measureIds: ['wait_experience', 'speed_of_service'] },
    { id: 'environment', label: 'Environment', measureIds: ['cleanliness_comfort'] },
    { id: 'return', label: 'Loyalty & return', measureIds: ['likelihood_to_return'] },
  ],
};

export const SECTOR_RECOMMENDATION_PROFILES: Record<string, SectorRecommendationProfile> = {
  beauty: BEAUTY_PROFILE,
  cafe: CAFE_PROFILE,
  clinic: CLINIC_PROFILE,
  hotel: HOTEL_PROFILE,
  generic: GENERIC_PROFILE,
};

// Resolves the demonstration profile from recorded onboarding context only.
// Prototype heuristic — production derives applicability from Product Truth.
export function resolveRecommendationProfile(organisation: Organisation): SectorRecommendationProfile {
  const onboarding = organisation.onboardingData;
  const haystack = [
    organisation.name,
    organisation.businessType,
    onboarding?.sector,
    onboarding?.category,
    ...(onboarding?.services || []),
    ...(onboarding?.serviceModels || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/(beauty|salon|spa|personal care|barber|hair|nail|massage|grooming)/.test(haystack))
    return BEAUTY_PROFILE;
  if (/(clinic|health|medical|dental|hospital|pharma|physio|diagnostic|lab)/.test(haystack))
    return CLINIC_PROFILE;
  // Hotels are their own experience-reference profile — never the Café profile.
  if (/(hotel|accommodation|resort|hostel|lodge|guesthouse|guest house)/.test(haystack))
    return HOTEL_PROFILE;
  if (/(caf|hospitality|dining|restaurant|bistro|food|bakery)/.test(haystack))
    return CAFE_PROFILE;
  return GENERIC_PROFILE;
}
