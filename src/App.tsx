import React, { useState, useMemo } from 'react';
import { PrototypeReviewBar } from './components/PrototypeReviewBar';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { OverviewView } from './components/OverviewView';
import { FeedbackPointsView } from './components/FeedbackPointsView';
import { FeedbackPointDetailView } from './components/FeedbackPointDetailView';
import { ChangeWhatWeTrackView } from './components/ChangeWhatWeTrackView';
import { WhatWeTrackView } from './components/WhatWeTrackView';
import { MeasureDetailView } from './components/MeasureDetailView';
import { LocationsView } from './components/LocationsView';
import { LocationDetailView } from './components/LocationDetailView';
import { ActivityView } from './components/ActivityView';
import { SettingsView } from './components/SettingsView';
import { ParticipantFeedbackView } from './components/ParticipantFeedbackView';
import { FirstRunSetup } from './components/FirstRunSetup';
import { OperatorView } from './components/OperatorView';
import { CreateEndpointModal } from './components/CreateEndpointModal';
import { PrintFlyerModal } from './components/PrintFlyerModal';

import { 
  AppRoute, 
  AppTab, 
  PrototypeScenario, 
  Organisation, 
  Location, 
  Endpoint, 
  Measure, 
  ServiceSignal, 
  FeedbackSession, 
  NeedsReviewItem,
  TeamMember 
} from './types';

import {
  GOVERNED_MEASURES,
  MULTI_LOCATION_ORGANISATION,
  MULTI_LOCATION_ENDPOINTS,
  MULTI_LOCATION_SIGNALS,
  MULTI_LOCATION_NEEDS_REVIEW,
  INITIAL_FEEDBACK_SESSIONS,
  INITIAL_TEAM_MEMBERS,
  SINGLE_LOCATION_ORGANISATION,
  SINGLE_LOCATION_ENDPOINTS,
  SINGLE_LOCATION_SIGNALS,
  SINGLE_LOCATION_SESSIONS,
  EMPTY_ORGANISATION,
  EMPTY_ENDPOINTS,
  EMPTY_SIGNALS,
  EMPTY_FEEDBACK_SESSIONS,
  EMPTY_NEEDS_REVIEW,
} from './data/mockData';

import { recalculateSignalWithSession } from './utils/feedbackUtils';
import { ScopeProvider } from './context/ScopeContext';
import { X, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Scenario state: Multi-location (Bubbles Café), Single-location SME (The Corner Bistro), or New Empty Org
  const [currentScenario, setCurrentScenario] = useState<PrototypeScenario>('multi-location');

  // Top-Level Route Perspective: 'app' (Organisation), 'setup' (First-run), 'feedback' (Customer Page), 'operator' (Platform Operator)
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('app');

  // Participant view mode: full-width responsive standalone vs simulated mobile phone frame
  const [participantViewMode, setParticipantViewMode] = useState<'standalone' | 'phone'>('phone');

  // Active navigation tab in Organisation dashboard
  const [activeTab, setActiveTab] = useState<AppTab | 'settings'>('overview');

  // First-class Scope primitive: 'all' or locationId
  const [currentScope, setCurrentScope] = useState<string>('all');

  // Primary language preference: English or French
  const [primaryLanguage, setPrimaryLanguage] = useState<'en' | 'fr'>('en');

  // Core Data State (initialized based on scenario)
  const [organisation, setOrganisation] = useState<Organisation>(MULTI_LOCATION_ORGANISATION);
  const [locations, setLocations] = useState<Location[]>(MULTI_LOCATION_ORGANISATION.locations);
  const [endpoints, setEndpoints] = useState<Endpoint[]>(MULTI_LOCATION_ENDPOINTS);
  const [measures] = useState<Measure[]>(GOVERNED_MEASURES);
  const [signals, setSignals] = useState<Record<string, ServiceSignal>>(MULTI_LOCATION_SIGNALS);
  const [sessions, setSessions] = useState<FeedbackSession[]>(INITIAL_FEEDBACK_SESSIONS);
  const [needsReviewItems, setNeedsReviewItems] = useState<NeedsReviewItem[]>(MULTI_LOCATION_NEEDS_REVIEW);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);

  // Drill-down Subview States
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [selectedMeasureId, setSelectedMeasureId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isChangingWhatWeTrack, setIsChangingWhatWeTrack] = useState<boolean>(false);
  const [endpointIdForTrackingChange, setEndpointIdForTrackingChange] = useState<string | null>(null);

  // Customer experience target endpoint
  const [customerEndpointId, setCustomerEndpointId] = useState<string | null>(null);

  // Modals
  const [isCreateEndpointModalOpen, setIsCreateEndpointModalOpen] = useState(false);
  const [printFlyerEndpoint, setPrintFlyerEndpoint] = useState<Endpoint | null>(null);

  // Live toast notifications
  const [liveToast, setLiveToast] = useState<string | null>(null);

  const showToast = (message: string, duration = 3500) => {
    setLiveToast(message);
    setTimeout(() => setLiveToast(null), duration);
  };

  // Reset or Switch Scenarios
  const loadScenarioData = (scenario: PrototypeScenario) => {
    setCurrentScenario(scenario);
    setSelectedEndpointId(null);
    setSelectedMeasureId(null);
    setSelectedLocationId(null);
    setIsChangingWhatWeTrack(false);

    if (scenario === 'multi-location') {
      setOrganisation(MULTI_LOCATION_ORGANISATION);
      setLocations(MULTI_LOCATION_ORGANISATION.locations);
      setEndpoints(MULTI_LOCATION_ENDPOINTS);
      setSignals(MULTI_LOCATION_SIGNALS);
      setSessions(INITIAL_FEEDBACK_SESSIONS);
      setNeedsReviewItems(MULTI_LOCATION_NEEDS_REVIEW);
      setCurrentScope('all');
      showToast('Loaded Multi-Location Scenario: Bubbles Café (3 branches)');
    } else if (scenario === 'single-location') {
      setOrganisation(SINGLE_LOCATION_ORGANISATION);
      setLocations(SINGLE_LOCATION_ORGANISATION.locations);
      setEndpoints(SINGLE_LOCATION_ENDPOINTS);
      setSignals(SINGLE_LOCATION_SIGNALS);
      setSessions(SINGLE_LOCATION_SESSIONS);
      setNeedsReviewItems([]);
      setCurrentScope(SINGLE_LOCATION_ORGANISATION.locations[0].id);
      showToast('Loaded Single-Location Scenario: The Corner Bistro');
    } else {
      setOrganisation(EMPTY_ORGANISATION);
      setLocations(EMPTY_ORGANISATION.locations);
      setEndpoints(EMPTY_ENDPOINTS);
      setSignals(EMPTY_SIGNALS);
      setSessions(EMPTY_FEEDBACK_SESSIONS);
      setNeedsReviewItems(EMPTY_NEEDS_REVIEW);
      setCurrentScope(EMPTY_ORGANISATION.locations[0].id);
      showToast('Loaded New Organisation Scenario: Zero Data / Fresh Setup');
    }
  };

  const handleResetData = () => {
    loadScenarioData(currentScenario);
  };

  // Active Scope Label
  const scopeLocationName = useMemo(() => {
    if (currentScope === 'all') {
      return locations.length > 1 ? 'All Locations' : locations[0]?.name || 'All Locations';
    }
    const loc = locations.find((l) => l.id === currentScope);
    return loc ? loc.name : 'Selected Location';
  }, [currentScope, locations]);

  // Aggregate responses count across locations
  const totalResponsesCount = useMemo(() => {
    return locations.reduce((sum, loc) => sum + loc.totalResponses, 0);
  }, [locations]);

  // Active needs-review items for current scope
  const activeNeedsReviewCount = useMemo(() => {
    if (currentScope === 'all') {
      return needsReviewItems.length;
    }
    return needsReviewItems.filter((i) => i.locationId === currentScope).length;
  }, [needsReviewItems, currentScope]);

  // Selected Objects
  const selectedEndpoint = endpoints.find((e) => e.id === selectedEndpointId);
  const selectedMeasure = measures.find((m) => m.id === selectedMeasureId);
  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  const endpointForTrackingChange = useMemo(() => {
    if (endpointIdForTrackingChange) {
      return endpoints.find((e) => e.id === endpointIdForTrackingChange) || endpoints[0];
    }
    if (selectedEndpointId) {
      return endpoints.find((e) => e.id === selectedEndpointId) || endpoints[0];
    }
    return endpoints[0];
  }, [endpoints, endpointIdForTrackingChange, selectedEndpointId]);

  // Endpoint for customer testing
  const activeCustomerEndpoint = useMemo(() => {
    if (customerEndpointId) {
      return endpoints.find((e) => e.id === customerEndpointId) || endpoints[0];
    }
    return endpoints[0] || {
      id: 'ep-preview',
      humanName: 'Main Entrance Stand',
      locationId: locations[0]?.id || 'loc-1',
      status: 'active',
      activeMeasureIds: ['overall_experience', 'speed_of_service', 'staff_courtesy', 'likelihood_to_return'],
      supportedChannels: ['qr', 'link'],
      createdAt: '2026-09-01',
      totalResponses: 0,
      burdenLevel: 'quick',
    };
  }, [endpoints, customerEndpointId, locations]);

  const activeCustomerLocation = useMemo(() => {
    return locations.find((l) => l.id === activeCustomerEndpoint?.locationId) || locations[0];
  }, [locations, activeCustomerEndpoint]);

  // Handle Tab Navigation (resets subview drilldowns)
  const handleTabChange = (tab: AppTab | 'settings') => {
    setActiveTab(tab);
    setSelectedEndpointId(null);
    setSelectedMeasureId(null);
    setSelectedLocationId(null);
    setIsChangingWhatWeTrack(false);
  };

  // Endpoint Actions
  const handleToggleEndpointStatus = (endpointId: string) => {
    setEndpoints((prev) =>
      prev.map((ep) =>
        ep.id === endpointId
          ? { ...ep, status: ep.status === 'active' ? 'paused' : 'active' }
          : ep
      )
    );
    showToast('Feedback point status updated.');
  };

  const handleSaveEndpointMeasureConfiguration = (newMeasureIds: string[], reasonNote: string) => {
    if (!endpointForTrackingChange) return;

    const updatedHistoryItem = {
      id: `hist-${Date.now()}`,
      timestamp: 'Just now',
      description: reasonNote,
      activeMeasureIds: newMeasureIds,
    };

    setEndpoints((prev) =>
      prev.map((ep) => {
        if (ep.id === endpointForTrackingChange.id) {
          return {
            ...ep,
            activeMeasureIds: newMeasureIds,
            burdenLevel: newMeasureIds.length <= 3 ? 'quick' : newMeasureIds.length <= 5 ? 'standard' : 'extended',
            configHistory: [updatedHistoryItem, ...(ep.configHistory || [])],
          };
        }
        return ep;
      })
    );

    setIsChangingWhatWeTrack(false);
    showToast('Configuration updated! Customers will now see the new questions instantly.');
  };

  const handleCreateEndpoint = (newEp: Endpoint) => {
    setEndpoints((prev) => [newEp, ...prev]);
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === newEp.locationId
          ? { ...loc, endpointsCount: loc.endpointsCount + 1 }
          : loc
      )
    );
    setIsCreateEndpointModalOpen(false);
    showToast(`Created new feedback point "${newEp.humanName}"`);
  };

  // Participant Feedback Submission
  const handleParticipantFeedbackSubmit = (newSession: FeedbackSession) => {
    // 1. Add session
    setSessions((prev) => [newSession, ...prev]);

    // 2. Increment location responses
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === newSession.locationId
          ? {
              ...loc,
              totalResponses: loc.totalResponses + 1,
              lastFeedbackAt: 'Just now',
              status: loc.totalResponses + 1 >= 40 ? 'active' : 'limited_evidence',
            }
          : loc
      )
    );

    // 3. Increment endpoint responses
    setEndpoints((prev) =>
      prev.map((ep) =>
        ep.id === newSession.endpointId
          ? { ...ep, totalResponses: ep.totalResponses + 1, lastResponseAt: 'Just now' }
          : ep
      )
    );

    // 4. Update service signals
    const updatedSignals = { ...signals };
    newSession.answers.forEach((ans) => {
      const measure = measures.find((m) => m.id === ans.measureId);
      if (!measure) return;

      const locKey = `${ans.measureId}_${newSession.locationId}`;
      if (updatedSignals[locKey]) {
        updatedSignals[locKey] = recalculateSignalWithSession(
          updatedSignals[locKey],
          measure,
          ans.scoreIndex,
          ans.selectedValue
        );
      }

      const allKey = `${ans.measureId}_all`;
      if (updatedSignals[allKey]) {
        updatedSignals[allKey] = recalculateSignalWithSession(
          updatedSignals[allKey],
          measure,
          ans.scoreIndex,
          ans.selectedValue
        );
      }
    });
    setSignals(updatedSignals);

    showToast('Customer response received live! Service signals updated.');
  };

  return (
    <ScopeProvider
      currentScope={currentScope}
      scopeLocationName={scopeLocationName}
      locations={locations}
      setCurrentScope={(scopeId) => {
        setCurrentScope(scopeId);
        setSelectedLocationId(null);
      }}
    >
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
        {/* 1. TOP PROTOTYPE REVIEW BAR */}
      <PrototypeReviewBar
        currentRoute={currentRoute}
        onRouteChange={(route) => {
          setCurrentRoute(route);
          if (route === 'app') {
            setIsChangingWhatWeTrack(false);
          }
        }}
        currentScenario={currentScenario}
        onScenarioChange={loadScenarioData}
        participantViewMode={participantViewMode}
        onParticipantViewModeChange={setParticipantViewMode}
        onResetData={handleResetData}
      />

      {/* 2. LIVE TOAST NOTIFICATION */}
      {liveToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{liveToast}</span>
          <button
            onClick={() => setLiveToast(null)}
            className="text-slate-400 hover:text-white ml-2"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* 3. ROUTE SWITCHING: APP, SETUP, FEEDBACK, OPERATOR */}
      {currentRoute === 'setup' ? (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FirstRunSetup
            onCompleteSetup={(newEndpoint) => {
              if (newEndpoint) {
                setEndpoints((prev) => [newEndpoint, ...prev]);
                setLocations((prev) =>
                  prev.map((l) =>
                    l.id === newEndpoint.locationId
                      ? { ...l, endpointsCount: l.endpointsCount + 1, status: 'active' }
                      : l
                  )
                );
              }
              setCurrentRoute('app');
              setActiveTab('overview');
              showToast('Setup complete! Your first feedback point is live.');
            }}
            onOpenCustomerPage={() => {
              setCurrentRoute('feedback');
            }}
          />
        </main>
      ) : currentRoute === 'feedback' ? (
        <main className="flex-1 w-full bg-slate-100 flex items-center justify-center p-0 sm:p-4">
          <ParticipantFeedbackView
            endpoint={activeCustomerEndpoint}
            locationName={activeCustomerLocation?.name || 'Main Location'}
            organisationName={organisation.name}
            measures={measures}
            viewMode={participantViewMode}
            onSubmitFeedback={handleParticipantFeedbackSubmit}
            onClose={() => setCurrentRoute('app')}
          />
        </main>
      ) : currentRoute === 'operator' ? (
        <main className="flex-1 w-full">
          <OperatorView
            measures={measures}
            onReturnToApp={() => setCurrentRoute('app')}
          />
        </main>
      ) : (
        /* STANDARD ORGANISATION DASHBOARD VIEW ('app') */
        <>
          {/* Header with First-Class Scope Selector */}
          <Header
            organisation={organisation}
            currentScope={currentScope}
            locations={locations}
            onScopeChange={(scopeId) => {
              setCurrentScope(scopeId);
              setSelectedLocationId(null);
            }}
            onOpenCustomerView={() => {
              setCustomerEndpointId(null);
              setCurrentRoute('feedback');
            }}
            onOpenSettings={() => {
              handleTabChange('settings');
            }}
            primaryLanguage={primaryLanguage}
            onToggleLanguage={() => setPrimaryLanguage((l) => (l === 'en' ? 'fr' : 'en'))}
            totalResponsesCount={totalResponsesCount}
          />

          {/* Primary Navigation Tabs */}
          <Navigation
            activeTab={activeTab === 'settings' ? 'overview' : activeTab}
            onTabChange={handleTabChange}
            needsReviewCount={activeNeedsReviewCount}
          />

          {/* Main Dashboard Canvas & Drill-downs */}
          <main className="flex-1 pb-16">
            {/* SUB-VIEW A: CHANGE WHAT WE TRACK GUIDED JOURNEY */}
            {isChangingWhatWeTrack && endpointForTrackingChange ? (
              <ChangeWhatWeTrackView
                endpoint={endpointForTrackingChange}
                allMeasures={measures}
                onCancel={() => setIsChangingWhatWeTrack(false)}
                onSaveConfiguration={handleSaveEndpointMeasureConfiguration}
              />
            ) : selectedEndpoint ? (
              /* SUB-VIEW B: FEEDBACK POINT DETAIL VIEW */
              <FeedbackPointDetailView
                endpoint={selectedEndpoint}
                location={locations.find((l) => l.id === selectedEndpoint.locationId)}
                allMeasures={measures}
                recentSessions={sessions}
                onBack={() => setSelectedEndpointId(null)}
                onToggleStatus={handleToggleEndpointStatus}
                onStartChangeWhatWeTrack={() => {
                  setEndpointIdForTrackingChange(selectedEndpoint.id);
                  setIsChangingWhatWeTrack(true);
                }}
                onOpenCustomerViewForEndpoint={(epId) => {
                  setCustomerEndpointId(epId);
                  setCurrentRoute('feedback');
                }}
                onOpenPrintFlyer={(ep) => setPrintFlyerEndpoint(ep)}
              />
            ) : selectedMeasure ? (
              /* SUB-VIEW C: MEASURE DETAIL VIEW */
              <MeasureDetailView
                measure={selectedMeasure}
                currentScope={currentScope}
                scopeLocationName={scopeLocationName}
                locations={locations}
                signals={signals}
                recentSessions={sessions}
                onBack={() => setSelectedMeasureId(null)}
                onSelectLocation={(locId) => {
                  setCurrentScope(locId);
                }}
              />
            ) : selectedLocation ? (
              /* SUB-VIEW D: LOCATION DETAIL VIEW */
              <LocationDetailView
                location={selectedLocation}
                endpoints={endpoints}
                measures={measures}
                signals={signals}
                recentSessions={sessions}
                needsReviewItems={needsReviewItems}
                onBack={() => setSelectedLocationId(null)}
                onSelectEndpoint={(epId) => setSelectedEndpointId(epId)}
                onSelectMeasure={(mId) => setSelectedMeasureId(mId)}
              />
            ) : activeTab === 'overview' ? (
              /* TAB 1: OVERVIEW DASHBOARD */
              <OverviewView
                currentScope={currentScope}
                scopeLocationName={scopeLocationName}
                locations={locations}
                measures={measures}
                signals={signals}
                endpoints={endpoints}
                recentSessions={sessions}
                needsReviewItems={needsReviewItems}
                onSelectMeasure={(id) => setSelectedMeasureId(id)}
                onNavigateTab={(tab) => handleTabChange(tab)}
                onSelectEndpoint={(id) => setSelectedEndpointId(id)}
                onStartSetup={() => setCurrentRoute('setup')}
              />
            ) : activeTab === 'feedback-points' ? (
              /* TAB 2: FEEDBACK POINTS */
              <FeedbackPointsView
                currentScope={currentScope}
                scopeLocationName={scopeLocationName}
                endpoints={endpoints}
                locations={locations}
                measures={measures}
                onSelectEndpoint={(id) => setSelectedEndpointId(id)}
                onCreateEndpointClick={() => setIsCreateEndpointModalOpen(true)}
                onOpenCustomerViewForEndpoint={(epId) => {
                  setCustomerEndpointId(epId);
                  setCurrentRoute('feedback');
                }}
              />
            ) : activeTab === 'what-we-track' ? (
              /* TAB 3: WHAT WE TRACK */
              <WhatWeTrackView
                measures={measures}
                signals={signals}
                currentScope={currentScope}
                scopeLocationName={scopeLocationName}
                onSelectMeasure={(id) => setSelectedMeasureId(id)}
              />
            ) : activeTab === 'locations' ? (
              /* TAB 4: LOCATIONS */
              <LocationsView
                locations={locations}
                endpoints={endpoints}
                onSelectLocation={(locId) => setSelectedLocationId(locId)}
              />
            ) : activeTab === 'activity' ? (
              /* TAB 5: RECENT CUSTOMER ACTIVITY */
              <ActivityView
                sessions={sessions}
                locations={locations}
                endpoints={endpoints}
                measures={measures}
                currentScope={currentScope}
                scopeLocationName={scopeLocationName}
              />
            ) : (
              /* TAB 6: SETTINGS */
              <SettingsView
                organisation={organisation}
                teamMembers={teamMembers}
                locations={locations}
                onUpdateOrganisation={(updates) =>
                  setOrganisation((prev) => ({ ...prev, ...updates }))
                }
                onAddTeamMember={(newMember) =>
                  setTeamMembers((prev) => [...prev, newMember])
                }
              />
            )}
          </main>
        </>
      )}

      {/* 4. MODALS */}
      {/* Create Feedback Point Modal */}
      {isCreateEndpointModalOpen && (
        <CreateEndpointModal
          locations={locations}
          measures={measures}
          defaultLocationId={currentScope === 'all' ? locations[0]?.id : currentScope}
          onClose={() => setIsCreateEndpointModalOpen(false)}
          onCreateEndpoint={handleCreateEndpoint}
        />
      )}

      {/* Printable Flyer Preview Modal */}
      {printFlyerEndpoint && (
        <PrintFlyerModal
          endpoint={printFlyerEndpoint}
          location={locations.find((l) => l.id === printFlyerEndpoint.locationId)}
          organisation={organisation}
          onClose={() => setPrintFlyerEndpoint(null)}
        />
      )}

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Fedoo</span>
            <span className="text-slate-400">•</span>
            <span>Always-on Service Feedback Platform</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Fedoo Experience Reference • Round 2 Shell Refinement
          </div>
        </div>
      </footer>
    </div>
    </ScopeProvider>
  );
}
