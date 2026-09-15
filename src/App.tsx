import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { OverviewView } from './components/OverviewView';
import { MeasuresView } from './components/MeasuresView';
import { EndpointsView } from './components/EndpointsView';
import { LocationsView } from './components/LocationsView';
import { EvidenceActivityView } from './components/EvidenceActivityView';
import { SettingsView } from './components/SettingsView';
import { MeasureDetailModal } from './components/MeasureDetailModal';
import { CreateEndpointModal } from './components/CreateEndpointModal';
import { ParticipantSimulator } from './components/ParticipantSimulator';
import { FirstRunSetup } from './components/FirstRunSetup';
import { OperatorView } from './components/OperatorView';

import { 
  INITIAL_ORGANISATION, 
  GOVERNED_MEASURES, 
  INITIAL_ENDPOINTS, 
  INITIAL_SIGNALS, 
  INITIAL_FEEDBACK_SESSIONS, 
  INITIAL_TEAM_MEMBERS 
} from './data/mockData';
import { Location, Endpoint, Measure, ServiceSignal, FeedbackSession, EndpointStatus, Organisation, TeamMember } from './types';
import { recalculateSignalWithSession } from './utils/feedbackUtils';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

export default function App() {
  // Application Modes: Organisation Dashboard vs First-Run Journey vs Fedoo Operator
  const [activeAppMode, setActiveAppMode] = useState<'organisation' | 'first-run' | 'operator'>('organisation');
  
  // Navigation Tabs in Organisation Dashboard
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Scope: 'all' or locationId
  const [currentScope, setCurrentScope] = useState<string>('all');

  // Core Data State
  const [organisation, setOrganisation] = useState<Organisation>(INITIAL_ORGANISATION);
  const [locations, setLocations] = useState<Location[]>(INITIAL_ORGANISATION.locations);
  const [endpoints, setEndpoints] = useState<Endpoint[]>(INITIAL_ENDPOINTS);
  const [measures, setMeasures] = useState<Measure[]>(GOVERNED_MEASURES);
  const [activeMeasureIds, setActiveMeasureIds] = useState<string[]>([
    'overall_experience',
    'speed_of_service',
    'staff_courtesy',
    'food_beverage_quality',
    'likelihood_to_return',
  ]);
  const [signals, setSignals] = useState<Record<string, ServiceSignal>>(INITIAL_SIGNALS);
  const [sessions, setSessions] = useState<FeedbackSession[]>(INITIAL_FEEDBACK_SESSIONS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [primaryLanguage, setPrimaryLanguage] = useState<'en' | 'fr'>('en');

  // Modals
  const [selectedMeasureIdForDetail, setSelectedMeasureIdForDetail] = useState<string | null>(null);
  const [isCreateEndpointModalOpen, setIsCreateEndpointModalOpen] = useState(false);
  const [isParticipantSimulatorOpen, setIsParticipantSimulatorOpen] = useState(false);
  const [simulatorEndpointId, setSimulatorEndpointId] = useState<string | null>(null);

  // Live Toast Notification
  const [liveToast, setLiveToast] = useState<string | null>(null);

  const totalResponsesCount = locations.reduce((acc, l) => acc + l.totalResponses, 0);

  // Toggle tracking of a measure
  const handleToggleMeasureActive = (measureId: string) => {
    if (activeMeasureIds.includes(measureId)) {
      if (activeMeasureIds.length <= 1) {
        alert('At least one measure must remain active.');
        return;
      }
      setActiveMeasureIds(activeMeasureIds.filter((id) => id !== measureId));
    } else {
      setActiveMeasureIds([...activeMeasureIds, measureId]);
    }
  };

  // Update Endpoint Status
  const handleUpdateEndpointStatus = (endpointId: string, newStatus: EndpointStatus) => {
    setEndpoints(
      endpoints.map((ep) => (ep.id === endpointId ? { ...ep, status: newStatus } : ep))
    );
  };

  // Update Endpoint Active Measures (without changing QR code)
  const handleUpdateEndpointMeasures = (endpointId: string, measureIds: string[]) => {
    setEndpoints(
      endpoints.map((ep) =>
        ep.id === endpointId
          ? {
              ...ep,
              activeMeasureIds: measureIds,
              burdenLevel: measureIds.length <= 3 ? 'quick' : measureIds.length <= 5 ? 'standard' : 'extended',
            }
          : ep
      )
    );
    setLiveToast('Doorway question set updated. Persistent QR code preserved.');
    setTimeout(() => setLiveToast(null), 3500);
  };

  // Create Endpoint
  const handleCreateEndpoint = (newEp: Endpoint) => {
    setEndpoints([newEp, ...endpoints]);
    setLocations(
      locations.map((loc) =>
        loc.id === newEp.locationId ? { ...loc, endpointsCount: loc.endpointsCount + 1 } : loc
      )
    );
    setLiveToast(`New doorway "${newEp.humanName}" published.`);
    setTimeout(() => setLiveToast(null), 3000);
  };

  // Add Location
  const handleAddLocation = (name: string, address: string) => {
    const newLoc: Location = {
      id: `loc-${Date.now().toString().slice(-4)}`,
      name,
      type: 'physical',
      addressOrDetail: address,
      totalResponses: 0,
      lastFeedbackAt: null,
      endpointsCount: 0,
      activeMeasuresCount: 5,
      status: 'limited_evidence',
    };
    setLocations([...locations, newLoc]);
    setLiveToast(`Service location "${name}" established.`);
    setTimeout(() => setLiveToast(null), 3000);
  };

  // Handle participant feedback submission in the simulator
  const handleParticipantFeedbackSubmit = (newSession: FeedbackSession) => {
    // 1. Add session
    setSessions([newSession, ...sessions]);

    // 2. Increment location responses
    setLocations(
      locations.map((loc) =>
        loc.id === newSession.locationId
          ? {
              ...loc,
              totalResponses: loc.totalResponses + 1,
              lastFeedbackAt: 'Just now',
              status: loc.totalResponses + 1 >= 50 ? 'active' : 'limited_evidence',
            }
          : loc
      )
    );

    // 3. Increment endpoint responses
    setEndpoints(
      endpoints.map((ep) =>
        ep.id === newSession.endpointId
          ? { ...ep, totalResponses: ep.totalResponses + 1, lastResponseAt: 'Just now' }
          : ep
      )
    );

    // 4. Update service signals for each answered measure
    const updatedSignals = { ...signals };

    newSession.answers.forEach((ans) => {
      const measure = measures.find((m) => m.id === ans.measureId);
      if (!measure) return;

      // Update location-specific signal
      const locKey = `${ans.measureId}_${newSession.locationId}`;
      if (updatedSignals[locKey]) {
        updatedSignals[locKey] = recalculateSignalWithSession(
          updatedSignals[locKey],
          measure,
          ans.scoreIndex,
          ans.selectedValue
        );
      }

      // Update consolidated 'all' signal
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

    const locObj = locations.find((l) => l.id === newSession.locationId);
    setLiveToast(`New customer feedback received for ${locObj?.name || 'Bubbles Café'}! Service signals updated live.`);
    setTimeout(() => setLiveToast(null), 4000);
  };

  // Open participant simulator
  const handleOpenParticipantSimulator = (endpointId?: string) => {
    const targetEp = endpointId
      ? endpoints.find((e) => e.id === endpointId) || endpoints[0]
      : endpoints[0];
    setSimulatorEndpointId(targetEp.id);
    setIsParticipantSimulatorOpen(true);
  };

  const activeSimulatorEndpoint = endpoints.find((e) => e.id === simulatorEndpointId) || endpoints[0];
  const activeSimulatorLocation =
    locations.find((l) => l.id === activeSimulatorEndpoint?.locationId) || locations[0];

  const selectedMeasureDetail = measures.find((m) => m.id === selectedMeasureIdForDetail);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{liveToast}</span>
          <button
            onClick={() => setLiveToast(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Persistent App Header */}
      <Header
        currentScope={currentScope}
        locations={locations}
        onScopeChange={setCurrentScope}
        activeAppMode={activeAppMode}
        onAppModeChange={setActiveAppMode}
        onOpenParticipantView={() => handleOpenParticipantSimulator()}
        primaryLanguage={primaryLanguage}
        onToggleLanguage={() => setPrimaryLanguage(primaryLanguage === 'en' ? 'fr' : 'en')}
        totalResponsesCount={totalResponsesCount}
      />

      {/* Main Content Area depends on App Mode */}
      {activeAppMode === 'first-run' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FirstRunSetup
            onCompleteSetup={() => setActiveAppMode('organisation')}
            onOpenSimulator={() => handleOpenParticipantSimulator()}
          />
        </main>
      ) : activeAppMode === 'operator' ? (
        <main className="flex-1 w-full">
          <OperatorView
            measures={measures}
            onReturnToApp={() => setActiveAppMode('organisation')}
          />
        </main>
      ) : (
        /* Standard Organisation Dashboard View */
        <>
          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            attentionCount={1}
            newFeedbackCount={sessions.length > 4 ? 1 : 0}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {activeTab === 'overview' && (
              <OverviewView
                currentScope={currentScope}
                locations={locations}
                measures={measures}
                endpoints={endpoints}
                signals={signals}
                recentSessions={sessions}
                onSelectMeasure={(id) => setSelectedMeasureIdForDetail(id)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenParticipantSimulator={handleOpenParticipantSimulator}
              />
            )}

            {activeTab === 'measures' && (
              <MeasuresView
                allMeasures={measures}
                activeMeasureIds={activeMeasureIds}
                onToggleMeasureActive={handleToggleMeasureActive}
                onSelectMeasureDetail={(id) => setSelectedMeasureIdForDetail(id)}
              />
            )}

            {activeTab === 'endpoints' && (
              <EndpointsView
                endpoints={endpoints}
                locations={locations}
                measures={measures}
                currentScope={currentScope}
                onUpdateEndpointStatus={handleUpdateEndpointStatus}
                onUpdateEndpointMeasures={handleUpdateEndpointMeasures}
                onCreateEndpointClick={() => setIsCreateEndpointModalOpen(true)}
                onOpenSimulatorForEndpoint={handleOpenParticipantSimulator}
              />
            )}

            {activeTab === 'locations' && (
              <LocationsView
                locations={locations}
                endpoints={endpoints}
                measures={measures}
                signals={signals}
                onSelectScopeLocation={(locId) => {
                  setCurrentScope(locId);
                  setActiveTab('overview');
                }}
                onSelectMeasureDetail={(id) => setSelectedMeasureIdForDetail(id)}
                onAddLocation={handleAddLocation}
              />
            )}

            {activeTab === 'activity' && (
              <EvidenceActivityView
                sessions={sessions}
                locations={locations}
                endpoints={endpoints}
                measures={measures}
                currentScope={currentScope}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                organisation={organisation}
                teamMembers={teamMembers}
                locations={locations}
                onUpdateOrganisation={(updates) => setOrganisation({ ...organisation, ...updates })}
                onAddTeamMember={(newMember) => setTeamMembers([...teamMembers, newMember])}
              />
            )}
          </main>
        </>
      )}

      {/* Measure Detail Inspection Modal */}
      {selectedMeasureDetail && (
        <MeasureDetailModal
          measure={selectedMeasureDetail}
          locations={locations}
          endpoints={endpoints}
          signals={signals}
          onClose={() => setSelectedMeasureIdForDetail(null)}
          onOpenParticipantView={() => {
            setSelectedMeasureIdForDetail(null);
            handleOpenParticipantSimulator();
          }}
          onNavigateToEndpoint={(epId) => {
            setSelectedMeasureIdForDetail(null);
            setActiveTab('endpoints');
          }}
        />
      )}

      {/* Create Endpoint Modal */}
      {isCreateEndpointModalOpen && (
        <CreateEndpointModal
          locations={locations}
          measures={measures}
          defaultLocationId={currentScope}
          onClose={() => setIsCreateEndpointModalOpen(false)}
          onCreateEndpoint={handleCreateEndpoint}
        />
      )}

      {/* Interactive Participant Feedback Simulator (Customer Experience) */}
      {isParticipantSimulatorOpen && activeSimulatorEndpoint && activeSimulatorLocation && (
        <ParticipantSimulator
          endpoint={activeSimulatorEndpoint}
          location={activeSimulatorLocation}
          measures={measures}
          onClose={() => setIsParticipantSimulatorOpen(false)}
          onSubmitFeedback={handleParticipantFeedbackSubmit}
          organisationName={organisation.name}
        />
      )}

      {/* Product Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Fedoo</span>
            <span className="text-slate-400">•</span>
            <span>Always-on Service Feedback Infrastructure</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Product truth determines what Fedoo does • Experience Reference establishes the human product shell
          </div>
        </div>
      </footer>
    </div>
  );
}
