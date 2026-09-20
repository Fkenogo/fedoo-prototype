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
import { FirstFeedbackPointWizard } from './components/FirstFeedbackPointWizard';
import { AddAreaToFeedbackPointsModal } from './components/AddAreaToFeedbackPointsModal';
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
  TeamMember,
  OnboardingData
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
  VERA_BEAUTY_ORGANISATION,
  VERA_BEAUTY_ENDPOINTS,
  VERA_BEAUTY_SIGNALS,
  VERA_BEAUTY_SESSIONS,
  VERA_BEAUTY_NEEDS_REVIEW,
  CITY_CLINIC_ORGANISATION,
  CITY_CLINIC_ENDPOINTS,
  CITY_CLINIC_SIGNALS,
  CITY_CLINIC_SESSIONS,
  CITY_CLINIC_NEEDS_REVIEW,
} from './data/mockData';

import { recalculateSignalWithSession } from './utils/feedbackUtils';
import { ScopeProvider } from './context/ScopeContext';
import { X, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Scenario state: Multi-location (Bubbles Café), Single-location SME (The Corner Bistro), or New Empty Org
  const [currentScenario, setCurrentScenario] = useState<PrototypeScenario>('multi-location');

  // Top-Level Route Perspective: 'app' (Organisation), 'setup' (First-run), 'feedback' (Customer Page), 'operator' (Platform Operator)
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('app');

  // Participant view mode: full-width responsive standalone vs simulated mobile phone frame.
  // The real participant route defaults to a full-viewport mobile experience;
  // the phone frame is organisation preview / Founder review tooling only.
  const [participantViewMode, setParticipantViewMode] = useState<'standalone' | 'phone'>('standalone');

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

  // Pass 4 participant review tooling (prototype only).
  const [participantPreviewMode, setParticipantPreviewMode] = useState(false);
  const [participantStatusOverride, setParticipantStatusOverride] =
    useState<'active' | 'paused' | null>(null);
  const [participantUnavailable, setParticipantUnavailable] = useState(false);

  // Pass 5 overview review tooling: force the no-evidence experience state.
  const [overviewNoEvidence, setOverviewNoEvidence] = useState(false);

  // Modals
  const [printFlyerEndpoint, setPrintFlyerEndpoint] = useState<Endpoint | null>(null);
  // Pass 3: lightweight "where would you like to track this?" flow.
  const [addAreaMeasureId, setAddAreaMeasureId] = useState<string | null>(null);

  // REFERENCE ONLY (prototype review tooling): toggles the future-state
  // Attention interaction inside the Organisation Overview. Default OFF —
  // never part of the adopted production Overview. See AttentionReferencePanel.
  const [showAttentionReference, setShowAttentionReference] = useState<boolean>(false);

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
    // Leave any in-progress guided flow so the new scenario's context is used.
    setCurrentRoute('app');

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
    } else if (scenario === 'vera-beauty') {
      setOrganisation(VERA_BEAUTY_ORGANISATION);
      setLocations(VERA_BEAUTY_ORGANISATION.locations);
      setEndpoints(VERA_BEAUTY_ENDPOINTS);
      setSignals(VERA_BEAUTY_SIGNALS);
      setSessions(VERA_BEAUTY_SESSIONS);
      setNeedsReviewItems(VERA_BEAUTY_NEEDS_REVIEW);
      setCurrentScope(VERA_BEAUTY_ORGANISATION.locations[0].id);
      showToast('Loaded Beauty Scenario: Vera Beauty (First Feedback Point)');
    } else if (scenario === 'city-clinic') {
      setOrganisation(CITY_CLINIC_ORGANISATION);
      setLocations(CITY_CLINIC_ORGANISATION.locations);
      setEndpoints(CITY_CLINIC_ENDPOINTS);
      setSignals(CITY_CLINIC_SIGNALS);
      setSessions(CITY_CLINIC_SESSIONS);
      setNeedsReviewItems(CITY_CLINIC_NEEDS_REVIEW);
      setCurrentScope(CITY_CLINIC_ORGANISATION.locations[0].id);
      showToast('Loaded Healthcare Scenario: City Clinic (First Feedback Point)');
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

  // Organisation-side "Test as customer": opens the participant experience in
  // preview mode (never records).
  const openParticipantPreview = (endpointId: string | null) => {
    setCustomerEndpointId(endpointId);
    setParticipantPreviewMode(true);
    setParticipantStatusOverride(null);
    setParticipantUnavailable(false);
    setCurrentRoute('feedback');
    window.scrollTo({ top: 0 });
  };

  const closeParticipant = () => {
    setCurrentRoute('app');
    setParticipantPreviewMode(false);
    setParticipantStatusOverride(null);
    setParticipantUnavailable(false);
  };

  // Opens the Pass 2 guided First Feedback Point flow.
  const openFeedbackPointWizard = () => {
    setSelectedEndpointId(null);
    setSelectedMeasureId(null);
    setSelectedLocationId(null);
    setIsChangingWhatWeTrack(false);
    setCurrentRoute('feedback-point-setup');
    window.scrollTo({ top: 0 });
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
    const target = endpoints.find((ep) => ep.id === endpointId);
    const willPause = target?.status === 'active';
    showToast(
      willPause
        ? `${target?.humanName || 'Feedback Point'} paused. Existing feedback and history remain available.`
        : `${target?.humanName || 'Feedback Point'} resumed — customers can share feedback again.`
    );
  };

  const handleSaveEndpointMeasureConfiguration = (newMeasureIds: string[], reasonNote: string) => {
    if (!endpointForTrackingChange) return;

    const previousIds = endpointForTrackingChange.activeMeasureIds;
    const added = newMeasureIds.filter((id) => !previousIds.includes(id));
    const removed = previousIds.filter((id) => !newMeasureIds.includes(id));

    const updatedHistoryItem = {
      id: `hist-${Date.now()}`,
      timestamp: 'Just now',
      description: reasonNote,
      activeMeasureIds: newMeasureIds,
      added,
      removed,
    };

    const updatedName = endpointForTrackingChange.humanName;

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
    showToast(`${updatedName} updated — future customer feedback will use your new tracking set.`);
  };

  // Pass 3: add one area to one or more Feedback Points.
  const handleAddAreaToEndpoints = (endpointIds: string[]) => {
    const measureId = addAreaMeasureId;
    if (!measureId || endpointIds.length === 0) return;
    const measureName = measures.find((m) => m.id === measureId)?.name || 'Area';

    setEndpoints((prev) =>
      prev.map((ep) => {
        if (!endpointIds.includes(ep.id)) return ep;
        if (ep.activeMeasureIds.includes(measureId)) return ep;
        const nextIds = [...ep.activeMeasureIds, measureId];
        return {
          ...ep,
          activeMeasureIds: nextIds,
          burdenLevel: nextIds.length <= 3 ? 'quick' : nextIds.length <= 5 ? 'standard' : 'extended',
          configHistory: [
            {
              id: `hist-${Date.now()}-${ep.id}`,
              timestamp: 'Just now',
              description: `Added ${measureName}`,
              activeMeasureIds: nextIds,
              added: [measureId],
            },
            ...(ep.configHistory || []),
          ],
        };
      })
    );

    setAddAreaMeasureId(null);
    showToast(
      `${measureName} added to ${endpointIds.length} ${
        endpointIds.length === 1 ? 'Feedback Point' : 'Feedback Points'
      }.`
    );
  };

  // Pass 3: stop tracking one area at one Feedback Point.
  const handleRemoveAreaFromEndpoint = (endpointId: string, measureId: string) => {
    const target = endpoints.find((ep) => ep.id === endpointId);
    if (!target) return;
    if (target.activeMeasureIds.length <= 1) {
      showToast('A Feedback Point needs at least one area to track.');
      return;
    }
    const measureName = measures.find((m) => m.id === measureId)?.name || 'Area';
    const nextIds = target.activeMeasureIds.filter((id) => id !== measureId);

    setEndpoints((prev) =>
      prev.map((ep) => {
        if (ep.id !== endpointId) return ep;
        return {
          ...ep,
          activeMeasureIds: nextIds,
          burdenLevel: nextIds.length <= 3 ? 'quick' : nextIds.length <= 5 ? 'standard' : 'extended',
          configHistory: [
            {
              id: `hist-${Date.now()}-${ep.id}`,
              timestamp: 'Just now',
              description: `Removed ${measureName}`,
              activeMeasureIds: nextIds,
              removed: [measureId],
            },
            ...(ep.configHistory || []),
          ],
        };
      })
    );

    showToast(
      `${measureName} removed at ${target.humanName}. Existing feedback remains in your history.`
    );
  };

  const handleCreateEndpoint = (newEp: Endpoint) => {
    setEndpoints((prev) => [newEp, ...prev]);
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === newEp.locationId
          ? { ...loc, endpointsCount: loc.endpointsCount + 1, status: 'active' }
          : loc
      )
    );
    showToast(`"${newEp.humanName}" is live — customers can now share feedback.`);
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

    showToast('Customer response recorded (prototype simulation — non-authoritative).');
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
          if (route === 'feedback') {
            // Review-bar "Customer Page" simulates a real participant by
            // default; preview/status overrides are toggled separately.
            setParticipantPreviewMode(false);
            setParticipantStatusOverride(null);
            setParticipantUnavailable(false);
            setCustomerEndpointId(endpoints[0]?.id ?? null);
          }
        }}
        currentScenario={currentScenario}
        onScenarioChange={loadScenarioData}
        participantViewMode={participantViewMode}
        onParticipantViewModeChange={setParticipantViewMode}
        onResetData={handleResetData}
        showAttentionReference={showAttentionReference}
        onToggleAttentionReference={() => setShowAttentionReference((v) => !v)}
        participantScenarios={endpoints.map((ep) => ({
          id: ep.id,
          label: `${locations.find((l) => l.id === ep.locationId)?.name || 'Location'} · ${ep.humanName}`,
        }))}
        selectedParticipantScenarioId={activeCustomerEndpoint?.id ?? null}
        onSelectParticipantScenario={(id) => setCustomerEndpointId(id)}
        participantStatus={participantStatusOverride ?? 'active'}
        onToggleParticipantStatus={() =>
          setParticipantStatusOverride((prev) => (prev === 'paused' ? 'active' : 'paused'))
        }
        participantPreviewMode={participantPreviewMode}
        onToggleParticipantPreviewMode={() => setParticipantPreviewMode((v) => !v)}
        participantUnavailable={participantUnavailable}
        onToggleParticipantUnavailable={() => setParticipantUnavailable((v) => !v)}
        overviewNoEvidence={overviewNoEvidence}
        onToggleOverviewNoEvidence={() => setOverviewNoEvidence((v) => !v)}
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
            onCompleteSetup={(onboardingData, destination) => {
              const newLocationId = 'loc-' + Date.now();
              const newLocation: Location = {
                id: newLocationId,
                name: onboardingData.firstLocationName,
                type: 'physical',
                addressOrDetail: onboardingData.firstLocationAddress || onboardingData.firstLocationCity,
                managerName: onboardingData.adminName,
                totalResponses: 0,
                lastFeedbackAt: null,
                endpointsCount: 0,
                activeMeasuresCount: 0,
                status: 'inactive',
              };

              const newOrg: Organisation = {
                id: 'org-' + Date.now(),
                name: onboardingData.organisationName,
                businessType: `${onboardingData.sector} (${onboardingData.category})`,
                operatingCountry: onboardingData.country,
                primaryLanguage: onboardingData.adminLanguage,
                locations: [newLocation],
                onboardingData: onboardingData,
              };

              const newAdmin: TeamMember = {
                id: 'user-' + Date.now(),
                name: onboardingData.adminName,
                email: onboardingData.adminEmail,
                role: 'Organisation Admin',
                locationScope: 'all',
              };

              // Apply newly onboarded organisation & location to prototype state
              setOrganisation(newOrg);
              setLocations([newLocation]);
              setEndpoints([]);
              setSignals({});
              setSessions([]);
              setNeedsReviewItems([]);
              setTeamMembers([newAdmin]);
              setCurrentScope(newLocationId);
              setPrimaryLanguage(onboardingData.adminLanguage);

              if (destination === 'feedback_point') {
                // Pass 2: go straight into the guided First Feedback Point flow.
                openFeedbackPointWizard();
                showToast(`${onboardingData.organisationName} created! Let's set up your first feedback point.`);
              } else {
                setCurrentRoute('app');
                setActiveTab('overview');
                showToast(`${onboardingData.organisationName} is ready in Fedoo.`);
              }
            }}
          />
        </main>
      ) : currentRoute === 'feedback-point-setup' ? (
        <main className="flex-1 w-full">
          <FirstFeedbackPointWizard
            organisation={organisation}
            locations={locations}
            measures={measures}
            defaultLocationId={currentScope === 'all' ? locations[0]?.id || '' : currentScope}
            onCancel={() => setCurrentRoute('app')}
            onActivate={handleCreateEndpoint}
            onGoToFeedbackPoints={() => {
              setCurrentRoute('app');
              handleTabChange('feedback-points');
            }}
            onAddAnotherLocation={() => {
              setCurrentRoute('app');
              handleTabChange('locations');
              showToast('Locations management is unchanged in this pass — add more Locations here.');
            }}
          />
        </main>
      ) : currentRoute === 'feedback' ? (
        <main className="flex-1 w-full bg-slate-100 flex items-center justify-center p-0 sm:p-4">
          <ParticipantFeedbackView
            endpoint={activeCustomerEndpoint}
            location={activeCustomerLocation}
            locationName={activeCustomerLocation?.name || 'Main Location'}
            organisation={organisation}
            organisationName={organisation.name}
            measures={measures}
            primaryLanguage={organisation.primaryLanguage}
            viewMode={participantViewMode}
            previewMode={participantPreviewMode}
            overrideStatus={participantStatusOverride}
            unavailable={participantUnavailable}
            onSubmitFeedback={handleParticipantFeedbackSubmit}
            onClose={closeParticipant}
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
            onOpenCustomerView={() => openParticipantPreview(null)}
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
                organisation={organisation}
                onCancel={() => setIsChangingWhatWeTrack(false)}
                onApplyChanges={handleSaveEndpointMeasureConfiguration}
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
                onOpenCustomerViewForEndpoint={(epId) => openParticipantPreview(epId)}
                onOpenPrintFlyer={(ep) => setPrintFlyerEndpoint(ep)}
                onViewAllActivity={() => handleTabChange('activity')}
              />
            ) : selectedMeasure ? (
              /* SUB-VIEW C: MEASURE DETAIL VIEW */
              <MeasureDetailView
                measure={selectedMeasure}
                currentScope={currentScope}
                scopeLocationName={scopeLocationName}
                locations={locations}
                endpoints={endpoints}
                signals={signals}
                recentSessions={sessions}
                onBack={() => setSelectedMeasureId(null)}
                onAddToAnotherFeedbackPoint={(measureId) => setAddAreaMeasureId(measureId)}
                onStopTrackingAt={handleRemoveAreaFromEndpoint}
                onOpenFeedbackPoint={(epId) => {
                  setSelectedMeasureId(null);
                  setSelectedEndpointId(epId);
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
                organisationName={organisation.name}
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
                onCreateFeedbackPoint={openFeedbackPointWizard}
                onTestAsCustomer={() => openParticipantPreview(endpoints[0]?.id ?? null)}
                showAttentionReference={showAttentionReference}
                noEvidenceOverride={overviewNoEvidence}
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
                onCreateEndpointClick={openFeedbackPointWizard}
                onOpenCustomerViewForEndpoint={(epId) => openParticipantPreview(epId)}
              />
            ) : activeTab === 'what-we-track' ? (
              /* TAB 3: WHAT WE TRACK */
              <WhatWeTrackView
                organisation={organisation}
                measures={measures}
                signals={signals}
                endpoints={endpoints}
                locations={locations}
                currentScope={currentScope}
                scopeLocationName={scopeLocationName}
                onSelectMeasure={(id) => setSelectedMeasureId(id)}
                onAddAreaToFeedbackPoints={(measureId) => setAddAreaMeasureId(measureId)}
                onViewActivity={() => handleTabChange('activity')}
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
      {/* Add an area to one or more Feedback Points (Pass 3) */}
      {addAreaMeasureId && (
        <AddAreaToFeedbackPointsModal
          measure={measures.find((m) => m.id === addAreaMeasureId)!}
          endpoints={endpoints}
          locations={locations}
          onClose={() => setAddAreaMeasureId(null)}
          onApply={handleAddAreaToEndpoints}
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
            Fedoo Experience Reference (prototype) • Simulation data — not production authority
          </div>
        </div>
      </footer>
    </div>
    </ScopeProvider>
  );
}
