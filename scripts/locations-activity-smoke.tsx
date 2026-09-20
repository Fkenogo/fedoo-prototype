// ============================================================================
// BOUNDED LOCATIONS & ACTIVITY SMOKE CHECKS (PROTOTYPE REVIEW TOOLING ONLY)
// ============================================================================
// Lightweight, dependency-free checks for the Pass 6 experience states:
// single Location, multiple Locations, zero Feedback Points at a Location,
// Activity Organisation scope, Activity Location scope, comments-only filter,
// no-activity state, no-match filter, and neutral answer presentation.
//
// Run: npm run test:locations-activity
// ============================================================================

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocationsView } from '../src/components/LocationsView';
import { LocationDetailView } from '../src/components/LocationDetailView';
import { ActivityView, applyActivityFilters } from '../src/components/ActivityView';
import {
  GOVERNED_MEASURES,
  VERA_BEAUTY_ORGANISATION,
  VERA_BEAUTY_ENDPOINTS,
  VERA_BEAUTY_SESSIONS,
  MULTI_LOCATION_ORGANISATION,
  MULTI_LOCATION_ENDPOINTS,
  MULTI_LOCATION_SIGNALS,
  INITIAL_FEEDBACK_SESSIONS,
  CITY_CLINIC_ORGANISATION,
  CITY_CLINIC_ENDPOINTS,
  CITY_CLINIC_SESSIONS,
} from '../src/data/mockData';
import { Location } from '../src/types';

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

console.log('Locations & activity smoke checks');

// 1. Single Location (Vera Beauty).
const vera = render(
  <LocationsView
    locations={VERA_BEAUTY_ORGANISATION.locations}
    endpoints={VERA_BEAUTY_ENDPOINTS}
    sessions={VERA_BEAUTY_SESSIONS}
    onSelectLocation={noop}
    onCreateLocation={noop}
  />
);
check('single location renders its name', vera.includes('Main Salon'));
check('location card shows Feedback Point count', vera.includes('2 Feedback Points'));
check('location card shows active count', vera.includes('2 Active'));
check('location card shows response count', vera.includes('21 responses'));
check('location card offers Add Location', vera.includes('Add Location'));
check('location status is factual (no Limited responses)', !vera.includes('Limited responses'));

// 2. Multiple Locations (Bubbles Café) — no ranking language.
const bubbles = render(
  <LocationsView
    locations={MULTI_LOCATION_ORGANISATION.locations}
    endpoints={MULTI_LOCATION_ENDPOINTS}
    sessions={INITIAL_FEEDBACK_SESSIONS}
    onSelectLocation={noop}
    onCreateLocation={noop}
    hasMoreLocationsHint
  />
);
check('multiple locations all render', ['Main Branch', 'Airport Concourse', 'City Centre Branch'].every((n) => bubbles.includes(n)));
check('no ranking language', !/best branch|worst branch|ranking|leaderboard/i.test(bubbles));
check('multi-location reminder shown when flagged', bubbles.includes('You mentioned you have more Locations'));

// 3. Zero Feedback Points at a Location.
const emptyLocation: Location = {
  id: 'loc-empty',
  name: 'New Studio',
  type: 'physical',
  addressOrDetail: 'Bujumbura',
  totalResponses: 0,
  lastFeedbackAt: null,
  endpointsCount: 0,
  activeMeasuresCount: 0,
  status: 'inactive',
};
const locationsWithEmpty = render(
  <LocationsView
    locations={[...VERA_BEAUTY_ORGANISATION.locations, emptyLocation]}
    endpoints={VERA_BEAUTY_ENDPOINTS}
    sessions={VERA_BEAUTY_SESSIONS}
    onSelectLocation={noop}
    onCreateLocation={noop}
  />
);
check('zero-FP location shows 0 Feedback Points', locationsWithEmpty.includes('0 Feedback Points'));
check('zero-FP location shows No feedback yet', locationsWithEmpty.includes('No feedback yet'));

const emptyDetail = render(
  <LocationDetailView
    location={emptyLocation}
    endpoints={VERA_BEAUTY_ENDPOINTS}
    measures={GOVERNED_MEASURES}
    recentSessions={VERA_BEAUTY_SESSIONS}
    onBack={noop}
    onSelectEndpoint={noop}
    onCreateFeedbackPoint={noop}
    onViewActivity={noop}
  />
);
check('location detail zero-FP empty state', emptyDetail.includes('No Feedback Points yet'));
check('location detail offers Create Feedback Point', emptyDetail.includes('Create Feedback Point'));

// 4. Location detail with Feedback Points.
const veraDetail = render(
  <LocationDetailView
    location={VERA_BEAUTY_ORGANISATION.locations[0]}
    endpoints={VERA_BEAUTY_ENDPOINTS}
    measures={GOVERNED_MEASURES}
    recentSessions={VERA_BEAUTY_SESSIONS}
    onBack={noop}
    onSelectEndpoint={noop}
    onCreateFeedbackPoint={noop}
    onViewActivity={noop}
  />
);
check('location detail lists Feedback Points', veraDetail.includes('Main Counter') && veraDetail.includes('Treatment Exit'));
check('location detail shows tracks N areas', /Tracks \d+ area/.test(veraDetail));

// 5. Activity — Organisation scope (Bubbles Café).
const activityOrg = render(
  <ActivityView
    sessions={INITIAL_FEEDBACK_SESSIONS}
    locations={MULTI_LOCATION_ORGANISATION.locations}
    endpoints={MULTI_LOCATION_ENDPOINTS}
    measures={GOVERNED_MEASURES}
    currentScope="all"
    scopeLocationName="All Locations"
  />
);
check('activity org scope shows multiple Locations', activityOrg.includes('Main Branch') && activityOrg.includes('Airport Concourse'));
check('activity copy avoids real-time claim', !/real-time/i.test(activityOrg));
check('activity shows channel labels not raw enum', activityOrg.includes('QR') && !/>qr</.test(activityOrg));
check('activity has no aggregate analytics', !/favourable|movement|benchmark|trend/i.test(activityOrg));

// 6. Activity — Location scope.
const activityAirport = render(
  <ActivityView
    sessions={INITIAL_FEEDBACK_SESSIONS}
    locations={MULTI_LOCATION_ORGANISATION.locations}
    endpoints={MULTI_LOCATION_ENDPOINTS}
    measures={GOVERNED_MEASURES}
    currentScope="loc-airport"
    scopeLocationName="Airport Concourse"
  />
);
check('activity location scope filters to that Location', activityAirport.includes('Airport Concourse') && !activityAirport.includes('Main Branch'));
check('activity location scope shows scope name', activityAirport.includes('Airport Concourse'));

// 7. Comments-only filter (pure).
const withCommentFree = [
  ...INITIAL_FEEDBACK_SESSIONS,
  { ...INITIAL_FEEDBACK_SESSIONS[0], id: 'sess-no-comment', optionalComment: undefined },
];
const commentsOnly = applyActivityFilters(withCommentFree, GOVERNED_MEASURES, {
  commentsOnly: true,
  searchQuery: '',
  locationId: 'all',
  endpointId: 'all',
  channel: 'all',
});
check('comments-only returns only commented sessions', commentsOnly.length > 0 && commentsOnly.every((s) => Boolean(s.optionalComment)));
check('comments-only excludes commented-free sessions', !commentsOnly.some((s) => s.id === 'sess-no-comment'));

// 8. No-match filter (pure).
const noMatch = applyActivityFilters(INITIAL_FEEDBACK_SESSIONS, GOVERNED_MEASURES, {
  commentsOnly: false,
  searchQuery: 'zzzzz-no-match',
  locationId: 'all',
  endpointId: 'all',
  channel: 'all',
});
check('no-match filter returns nothing', noMatch.length === 0);

// 9. No-activity state.
const noActivity = render(
  <ActivityView
    sessions={INITIAL_FEEDBACK_SESSIONS}
    locations={MULTI_LOCATION_ORGANISATION.locations}
    endpoints={MULTI_LOCATION_ENDPOINTS}
    measures={GOVERNED_MEASURES}
    currentScope="all"
    scopeLocationName="All Locations"
    forceEmpty
    onViewFeedbackPoints={noop}
    onTestAsCustomer={noop}
  />
);
check('no-activity state heading', noActivity.includes('No feedback yet'));
check('no-activity state offers View Feedback Points', noActivity.includes('View Feedback Points'));

// 10. City Clinic limited activity renders.
const clinicActivity = render(
  <ActivityView
    sessions={CITY_CLINIC_SESSIONS}
    locations={CITY_CLINIC_ORGANISATION.locations}
    endpoints={CITY_CLINIC_ENDPOINTS}
    measures={GOVERNED_MEASURES}
    currentScope="loc-clinic-main"
    scopeLocationName="City Clinic — Main"
  />
);
check('limited activity renders sessions', clinicActivity.includes('Reception'));

// 11. Neutral answer presentation (no favourable colour-coding).
check('answers are visually neutral', !/bg-emerald-50\/60|isFavourable/.test(activityOrg));

console.log(failures === 0 ? '\nALL LOCATIONS & ACTIVITY SMOKE CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
