// ============================================================================
// BOUNDED WHOLE-PROTOTYPE COHERENCE CHECKS (PROTOTYPE REVIEW TOOLING ONLY)
// ============================================================================
// Cross-pass checks for the acceptance review: Organisation surfaces must not
// leak internal/architecture terminology, tracking terminology must be
// consistent, the participant experience must stay jargon-free, and the
// Product Ops catalogue/subset distinction must hold.
//
// Run: npm run test:coherence
// ============================================================================

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FeedbackPointsView } from '../src/components/FeedbackPointsView';
import { WhatWeTrackView } from '../src/components/WhatWeTrackView';
import { LocationsView } from '../src/components/LocationsView';
import { ActivityView } from '../src/components/ActivityView';
import { OverviewView } from '../src/components/OverviewView';
import { ParticipantFeedbackView } from '../src/components/ParticipantFeedbackView';
import { OpsOverview } from '../src/components/operator/OpsSections';
import { buildProductOpsModel } from '../src/data/productOpsData';
import {
  GOVERNED_MEASURES,
  VERA_BEAUTY_ORGANISATION,
  VERA_BEAUTY_ENDPOINTS,
  VERA_BEAUTY_SIGNALS,
  VERA_BEAUTY_SESSIONS,
  MULTI_LOCATION_ORGANISATION,
  MULTI_LOCATION_ENDPOINTS,
  MULTI_LOCATION_SIGNALS,
  INITIAL_FEEDBACK_SESSIONS,
} from '../src/data/mockData';

const noop = () => {};
let failures = 0;
function check(name: string, condition: boolean) {
  if (condition) console.log(`  ok   ${name}`);
  else {
    failures += 1;
    console.log(`  FAIL ${name}`);
  }
}
const decode = (html: string) =>
  html.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
const render = (el: React.ReactElement) => decode(renderToStaticMarkup(el));

// Internal / architecture terms that must not appear in normal Organisation UI.
const INTERNAL = /\b(governed|instrument|instruments|compatibility class|effective session|canonical|lineage|product truth|architecture|fail-loud|immutable|EA-0\d)\b/i;

const org = VERA_BEAUTY_ORGANISATION;

const feedbackPoints = render(
  <FeedbackPointsView
    currentScope="loc-vera-main"
    scopeLocationName="Main Salon"
    endpoints={VERA_BEAUTY_ENDPOINTS}
    locations={org.locations}
    measures={GOVERNED_MEASURES}
    onSelectEndpoint={noop}
    onCreateEndpointClick={noop}
    onOpenCustomerViewForEndpoint={noop}
  />
);
const whatWeTrack = render(
  <WhatWeTrackView
    organisation={org}
    measures={GOVERNED_MEASURES}
    signals={VERA_BEAUTY_SIGNALS}
    endpoints={VERA_BEAUTY_ENDPOINTS}
    locations={org.locations}
    currentScope="loc-vera-main"
    scopeLocationName="Main Salon"
    onSelectMeasure={noop}
    onAddAreaToFeedbackPoints={noop}
    onViewActivity={noop}
  />
);
const locations = render(
  <LocationsView
    locations={MULTI_LOCATION_ORGANISATION.locations}
    endpoints={MULTI_LOCATION_ENDPOINTS}
    sessions={INITIAL_FEEDBACK_SESSIONS}
    onSelectLocation={noop}
    onCreateLocation={noop}
  />
);
const activity = render(
  <ActivityView
    sessions={INITIAL_FEEDBACK_SESSIONS}
    locations={MULTI_LOCATION_ORGANISATION.locations}
    endpoints={MULTI_LOCATION_ENDPOINTS}
    measures={GOVERNED_MEASURES}
    currentScope="all"
    scopeLocationName="All Locations"
  />
);
const overview = render(
  <OverviewView
    organisationName="Bubbles Café"
    currentScope="all"
    scopeLocationName="All Locations"
    locations={MULTI_LOCATION_ORGANISATION.locations}
    measures={GOVERNED_MEASURES}
    signals={MULTI_LOCATION_SIGNALS}
    endpoints={MULTI_LOCATION_ENDPOINTS}
    recentSessions={INITIAL_FEEDBACK_SESSIONS}
    needsReviewItems={[]}
    onSelectMeasure={noop}
    onNavigateTab={noop}
    onSelectEndpoint={noop}
    onStartSetup={noop}
  />
);

console.log('Whole-prototype coherence checks');

// 1. No internal terminology in normal Organisation surfaces.
check('Feedback Points has no internal terminology', !INTERNAL.test(feedbackPoints));
check('What We Track has no internal terminology', !INTERNAL.test(whatWeTrack));
check('Locations has no internal terminology', !INTERNAL.test(locations));
check('Activity has no internal terminology', !INTERNAL.test(activity));
check('Overview has no internal terminology', !INTERNAL.test(overview));

// 2. Tracking terminology consistency: areas, not questions, at Organisation level.
check('Feedback Point list uses "areas tracked"', feedbackPoints.includes('areas tracked'));
check('Feedback Point list does not say "questions tracked"', !feedbackPoints.includes('questions tracked'));
check('What We Track frames areas/visibility', /area|track/i.test(whatWeTrack));

// 3. Participant experience stays jargon-free and branded.
const participant = render(
  <ParticipantFeedbackView
    endpoint={VERA_BEAUTY_ENDPOINTS[0]}
    location={org.locations[0]}
    organisation={org}
    measures={GOVERNED_MEASURES}
    primaryLanguage="en"
    onSubmitFeedback={noop}
  />
);
check('participant UI has no internal terminology', !INTERNAL.test(participant));
check('participant UI avoids prototype/fixture wording', !/prototype|fixture|simulation/i.test(participant));
check('participant footer is Powered by Fedoo', participant.includes('Powered by Fedoo'));

// 4. Product Ops distinguishes canonical catalogue from loaded subset.
const opsModel = buildProductOpsModel(GOVERNED_MEASURES);
const opsOverview = render(
  <OpsOverview
    model={opsModel}
    onNavigate={noop}
    onCreateDraft={noop}
    onAdvanceDraft={noop}
    onUpdateDraftBody={noop}
    onToggleDiagnostic={noop}
    onToggleDescriptor={noop}
    onToggleRecommendationMeasure={noop}
  />
);
check('Product Ops overview distinguishes canonical vs loaded', opsOverview.includes('Canonical catalogue') && opsOverview.includes('Loaded in this prototype workspace'));

console.log(failures === 0 ? '\nALL COHERENCE CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
