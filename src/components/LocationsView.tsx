import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  BarChart2, 
  QrCode, 
  Target, 
  Sliders, 
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Location, Endpoint, Measure, ServiceSignal } from '../types';

interface LocationsViewProps {
  locations: Location[];
  endpoints: Endpoint[];
  measures: Measure[];
  signals: Record<string, ServiceSignal>;
  onSelectScopeLocation: (locationId: string) => void;
  onSelectMeasureDetail: (measureId: string) => void;
  onAddLocation: (name: string, address: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  endpoints,
  measures,
  signals,
  onSelectScopeLocation,
  onSelectMeasureDetail,
  onAddLocation,
}) => {
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [comparisonMeasureId, setComparisonMeasureId] = useState<string>('speed_of_service');

  const selectedMeasure = measures.find((m) => m.id === comparisonMeasureId) || measures[0];

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    onAddLocation(newLocName.trim(), newLocAddress.trim() || 'Physical branch');
    setNewLocName('');
    setNewLocAddress('');
    setShowAddLocationModal(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              Service Areas & Branches
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Locations & Contexts
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
              Track how service experiences differ across branches, outlets, or operational units. Compare signals side by side while honoring evidence sufficiency.
            </p>
          </div>

          <button
            onClick={() => setShowAddLocationModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Location</span>
          </button>
        </div>
      </div>

      {/* Cross-Location Comparative Signal Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cross-Location Benchmark
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Compare Dimension: {selectedMeasure.name}
            </h2>
            <p className="text-xs text-slate-500">
              Observing variation across operating settings with explicit evidence volume.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Measure:</span>
            <select
              value={comparisonMeasureId}
              onChange={(e) => setComparisonMeasureId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-700/20"
            >
              {measures.slice(0, 5).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Bars */}
        <div className="space-y-5">
          {locations.map((loc) => {
            const signalKey = `${comparisonMeasureId}_${loc.id}`;
            const signal = signals[signalKey];
            const favourable = signal ? signal.favourablePercentage : 75;
            const count = signal ? signal.responseCount : loc.totalResponses;
            const isEarly = count < 50;

            return (
              <div key={loc.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{loc.name}</span>
                    <span className="text-xs text-slate-500">• {loc.addressOrDetail}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isEarly
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isEarly ? 'Early signal (< 50)' : 'Stable evidence'}
                    </span>

                    <span className="text-sm font-extrabold text-slate-900">
                      {favourable}% <span className="text-xs font-normal text-slate-500">favourable</span>
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      ({count} responses)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${favourable}%` }}
                    className={`h-full rounded-full transition-all ${
                      favourable >= 80
                        ? 'bg-emerald-600'
                        : favourable >= 70
                        ? 'bg-emerald-500'
                        : favourable >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>

                {signal?.attentionFlag && (
                  <div className="mt-2.5 text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <strong>Notice:</strong> {signal.attentionFlag.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Locations Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {locations.map((loc) => {
          const locEndpoints = endpoints.filter((e) => e.locationId === loc.id);
          const isEarly = loc.totalResponses < 50;

          return (
            <div
              key={loc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Physical Branch
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-0.5">{loc.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isEarly
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {isEarly ? 'Early volume' : 'Healthy volume'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1">{loc.addressOrDetail}</p>

                {/* Evidence Metrics */}
                <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Collected Feedback:</span>
                    <span className="font-bold text-slate-900">{loc.totalResponses} responses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Doorways:</span>
                    <span className="font-bold text-slate-900">{locEndpoints.length} endpoints</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Evidence:</span>
                    <span className="font-semibold text-slate-700">{loc.lastFeedbackAt || 'Never'}</span>
                  </div>
                </div>

                {/* Doorways list */}
                <div className="mt-4">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5">Doorways at this branch:</div>
                  <div className="space-y-1">
                    {locEndpoints.map((ep) => (
                      <div
                        key={ep.id}
                        className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between text-slate-700"
                      >
                        <span className="truncate">{ep.humanName}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-700">
                          {ep.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onSelectScopeLocation(loc.id)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200/90 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Filter Signals to {loc.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Location */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Add Service Location</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Establish a new branch, store, or service context.
            </p>

            <form onSubmit={handleCreateLocation} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westlands Branch, Terminal 2 Kiosk"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Address / Detail</label>
                <input
                  type="text"
                  placeholder="e.g. Sarit Centre, Ground Floor"
                  value={newLocAddress}
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg"
                >
                  Create Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
